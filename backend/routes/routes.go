package routes

import (
	"backend/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Dashboard
		api.GET("/dashboard", handlers.GetDashboard)

		// Products
		api.GET("/products", handlers.GetProducts)
		api.GET("/product/:id", handlers.GetProduct)
		api.GET("/productByCategory/:categoryID", handlers.GetProductByCategory)
		api.POST("/addProduct", handlers.AddProduct)
		// Categories
		api.GET("/categories", handlers.GetCategories)
		api.GET("/category/:id", handlers.GetCategory)
		api.POST("/addCategory", handlers.AddCategory)
		// sales
		api.GET("/sales", handlers.GetSales)
		api.GET("/sale/:id", handlers.GetSaleById)
	}
}
