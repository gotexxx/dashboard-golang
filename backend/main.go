package main

import (
	"backend/config"
	"backend/database"
	"backend/routes"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Initialize the connection first!
	config.ConnectDB()

	// 2. Now get the underlying sql.DB for Goose
	sqlDB, err := config.DB.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}

	// 3. Run structure migrations (Goose)
	database.RunMigrations(sqlDB)

	// 4. Run data seeding (GORM)
	database.SeedData(config.DB)

	r := gin.Default()

	// Simple CORS config
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH"},
		AllowHeaders: []string{"Origin", "Content-Type"},
	}))

	routes.SetupRoutes(r)
	r.Run(":8080")
}
