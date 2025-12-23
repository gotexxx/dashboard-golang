package database

import (
	"backend/models"
	"log"
	"time"

	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) {
	log.Println("Seeding rich dataset...")

	// 1. Expanded Categories
	categories := map[string]*models.Category{
		"Software": {Name: "Software"},
		"Hardware": {Name: "Hardware"},
		"Services": {Name: "Services"},
		"Cloud":    {Name: "Cloud"},
	}

	for name, cat := range categories {
		db.Where(models.Category{Name: name}).FirstOrCreate(cat)
	}

	// 2. Expanded Products
	productList := []models.Product{
		{Name: "AI Assistant Pro", CategoryID: categories["Software"].ID, Price: 99.99},
		{Name: "Smart Camera v2", CategoryID: categories["Hardware"].ID, Price: 149.50},
		{Name: "Premium Support", CategoryID: categories["Services"].ID, Price: 500.00},
		{Name: "Cloud Storage 1TB", CategoryID: categories["Cloud"].ID, Price: 12.00},
		{Name: "Data Analytics Suite", CategoryID: categories["Software"].ID, Price: 299.00},
		{Name: "Edge Gateway", CategoryID: categories["Hardware"].ID, Price: 89.00},
	}

	for i := range productList {
		db.Where(models.Product{Name: productList[i].Name}).FirstOrCreate(&productList[i])
	}

	// 3. Historical Sales Data
	var saleCount int64
	db.Model(&models.Sale{}).Count(&saleCount)

	if saleCount == 0 {
		log.Println("Generating historical sales data...")

		var newSales []models.Sale

		// Logic: For each product, create a sale for each of the last 3 months
		for _, prod := range productList {
			for i := 0; i < 3; i++ {
				monthAgo := time.Now().AddDate(0, -i, 0)

				// Vary the quantity slightly based on the index to make data look "real"
				qty := 10 + (i * 5)

				newSales = append(newSales, models.Sale{
					ProductID: prod.ID,
					Quantity:  qty,
					Revenue:   float64(qty) * prod.Price,
					Date:      monthAgo,
				})
			}
		}

		// GORM Batch Insert (Efficient)
		if err := db.Create(&newSales).Error; err != nil {
			log.Printf("Could not seed sales: %v", err)
		}
	}

	log.Println("Seeding complete!")
}
