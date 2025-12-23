package database

import (
	"backend/models"
	"log"
	"math/rand"
	"time"

	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) {
	log.Println("Seeding comprehensive dataset...")

	// 1. Expanded Categories
	categories := map[string]*models.Category{
		"Software":      {Name: "Software"},
		"Hardware":      {Name: "Hardware"},
		"Services":      {Name: "Services"},
		"Cloud":         {Name: "Cloud"},
		"AI/ML":         {Name: "AI/ML"},
		"Cybersecurity": {Name: "Cybersecurity"},
		"IoT":           {Name: "IoT"},
		"Blockchain":    {Name: "Blockchain"},
		"Mobile":        {Name: "Mobile"},
		"Web":           {Name: "Web"},
	}

	for name, cat := range categories {
		db.Where(models.Category{Name: name}).FirstOrCreate(cat)
	}

	// 2. Expanded Products (30+ products)
	productList := []models.Product{
		// Software
		{Name: "AI Assistant Pro", CategoryID: categories["Software"].ID, Price: 99.99},
		{Name: "Data Analytics Suite", CategoryID: categories["Software"].ID, Price: 299.00},
		{Name: "Project Management Tool", CategoryID: categories["Software"].ID, Price: 45.00},
		{Name: "CRM Enterprise", CategoryID: categories["Software"].ID, Price: 199.00},
		{Name: "Accounting Pro", CategoryID: categories["Software"].ID, Price: 89.99},

		// Hardware
		{Name: "Smart Camera v2", CategoryID: categories["Hardware"].ID, Price: 149.50},
		{Name: "Edge Gateway", CategoryID: categories["Hardware"].ID, Price: 89.00},
		{Name: "Industrial Sensor", CategoryID: categories["Hardware"].ID, Price: 75.25},
		{Name: "Server Rack X900", CategoryID: categories["Hardware"].ID, Price: 4500.00},
		{Name: "Network Switch 48-Port", CategoryID: categories["Hardware"].ID, Price: 1299.99},

		// Services
		{Name: "Premium Support", CategoryID: categories["Services"].ID, Price: 500.00},
		{Name: "Consulting Package", CategoryID: categories["Services"].ID, Price: 2500.00},
		{Name: "Training Program", CategoryID: categories["Services"].ID, Price: 1200.00},
		{Name: "Implementation Service", CategoryID: categories["Services"].ID, Price: 3500.00},

		// Cloud
		{Name: "Cloud Storage 1TB", CategoryID: categories["Cloud"].ID, Price: 12.00},
		{Name: "Compute Instance", CategoryID: categories["Cloud"].ID, Price: 85.00},
		{Name: "Database Hosting", CategoryID: categories["Cloud"].ID, Price: 150.00},
		{Name: "CDN Service", CategoryID: categories["Cloud"].ID, Price: 45.00},

		// AI/ML
		{Name: "ML Model Training", CategoryID: categories["AI/ML"].ID, Price: 899.00},
		{Name: "Vision API", CategoryID: categories["AI/ML"].ID, Price: 45.00},
		{Name: "NLP Toolkit", CategoryID: categories["AI/ML"].ID, Price: 299.00},

		// Cybersecurity
		{Name: "Firewall Suite", CategoryID: categories["Cybersecurity"].ID, Price: 599.00},
		{Name: "Penetration Testing", CategoryID: categories["Cybersecurity"].ID, Price: 2500.00},
		{Name: "Threat Intelligence", CategoryID: categories["Cybersecurity"].ID, Price: 1500.00},

		// IoT
		{Name: "IoT Hub", CategoryID: categories["IoT"].ID, Price: 299.00},
		{Name: "Sensor Pack", CategoryID: categories["IoT"].ID, Price: 99.00},

		// Blockchain
		{Name: "Smart Contract Audit", CategoryID: categories["Blockchain"].ID, Price: 5000.00},
		{Name: "DLT Integration", CategoryID: categories["Blockchain"].ID, Price: 7500.00},

		// Mobile
		{Name: "Mobile App Framework", CategoryID: categories["Mobile"].ID, Price: 199.00},
		{Name: "Push Notification Service", CategoryID: categories["Mobile"].ID, Price: 49.00},

		// Web
		{Name: "Web Hosting Pro", CategoryID: categories["Web"].ID, Price: 29.99},
		{Name: "SSL Certificate", CategoryID: categories["Web"].ID, Price: 89.00},
	}

	for i := range productList {
		db.Where(models.Product{Name: productList[i].Name}).FirstOrCreate(&productList[i])
	}

	// 3. Historical Sales Data (6 months of data for each product)
	var saleCount int64
	db.Model(&models.Sale{}).Count(&saleCount)

	if saleCount == 0 {
		log.Println("Generating comprehensive historical sales data...")

		rand.Seed(time.Now().UnixNano())
		var newSales []models.Sale

		// Generate 6 months of data for each product
		for _, prod := range productList {
			for month := 0; month < 6; month++ {
				// Base sales with some randomness
				baseQuantity := 5 + month*3 + rand.Intn(10)

				// Create 2-4 sales per month per product (simulating multiple transactions)
				salesPerMonth := 2 + rand.Intn(3)

				for sale := 0; sale < salesPerMonth; sale++ {
					// Add some variation to quantity
					quantity := baseQuantity + rand.Intn(5) - 2
					if quantity < 1 {
						quantity = 1
					}

					// Random day within the month
					daysInMonth := 30
					day := 1 + rand.Intn(daysInMonth)

					saleDate := time.Now().AddDate(0, -month, -day)

					// Add random discounts/promotions (10% chance)
					finalPrice := prod.Price
					if rand.Float64() < 0.1 {
						finalPrice = prod.Price * (0.8 + 0.2*rand.Float64()) // 20-100% of price
					}

					newSales = append(newSales, models.Sale{
						ProductID: prod.ID,
						Quantity:  quantity,
						Revenue:   float64(quantity) * finalPrice,
						Date:      saleDate,
					})
				}
			}
		}

		// Batch insert in chunks of 100
		batchSize := 100
		for i := 0; i < len(newSales); i += batchSize {
			end := i + batchSize
			if end > len(newSales) {
				end = len(newSales)
			}

			batch := newSales[i:end]
			if err := db.Create(&batch).Error; err != nil {
				log.Printf("Error seeding sales batch: %v", err)
			}
		}

		log.Printf("Generated %d sales records", len(newSales))
	}

	// 4. Dashboards
	log.Println("Seeding dashboards...")
	dashboards := []models.Dashboard{
		{
			Name:        "Executive Overview",
			Description: "High-level metrics for executives and stakeholders",
			CreatedAt:   time.Now().AddDate(0, -6, 0),
		},
		{
			Name:        "Sales Performance",
			Description: "Detailed sales analytics and revenue tracking",
			CreatedAt:   time.Now().AddDate(0, -4, 0),
		},
		{
			Name:        "Product Analytics",
			Description: "Product usage, performance, and customer feedback",
			CreatedAt:   time.Now().AddDate(0, -3, 0),
		},
		{
			Name:        "Customer Insights",
			Description: "Customer behavior and feedback analysis",
			CreatedAt:   time.Now().AddDate(0, -2, 0),
		},
		{
			Name:        "Technical Metrics",
			Description: "System performance, uptime, and technical KPIs",
			CreatedAt:   time.Now().AddDate(0, -1, 0),
		},
	}

	for i := range dashboards {
		db.Where(models.Dashboard{Name: dashboards[i].Name}).FirstOrCreate(&dashboards[i])
	}

	// 5. Metrics for each dashboard
	log.Println("Seeding metrics...")
	metricTypes := []struct {
		name string
		unit string
		min  float64
		max  float64
	}{
		{"Revenue", "USD", 10000, 500000},
		{"Active Users", "users", 100, 10000},
		{"Monthly Recurring Revenue", "USD", 5000, 200000},
		{"Customer Churn Rate", "%", 0.5, 15},
		{"Customer Satisfaction", "score", 3.5, 5.0},
		{"Response Time", "ms", 50, 2000},
		{"Uptime", "%", 95, 99.99},
		{"Conversion Rate", "%", 1, 25},
		{"Customer Acquisition Cost", "USD", 50, 500},
		{"Lifetime Value", "USD", 500, 5000},
	}

	var allMetrics []models.Metric
	for _, dashboard := range dashboards {
		for _, metricType := range metricTypes {
			// Create 3 months of metric data
			for month := 0; month < 1; month++ {
				value := metricType.min + rand.Float64()*(metricType.max-metricType.min)

				// Add some trending (increase or decrease)
				trend := 1.0
				if month == 1 {
					trend = 1.05
				} else if month == 2 {
					trend = 1.1
				}
				value *= trend

				allMetrics = append(allMetrics, models.Metric{
					DashboardID: dashboard.ID,
					Name:        metricType.name,
					Value:       value,
					Unit:        metricType.unit,
					CreatedAt:   time.Now().AddDate(0, -month, 0),
				})
			}
		}
	}

	// Insert metrics
	for i := range allMetrics {
		db.Create(&allMetrics[i])
	}

	// 6. Feedback for each dashboard
	log.Println("Seeding feedback...")
	feedbackMessages := []struct {
		message   string
		sentiment string
	}{
		// Positive
		{"Great dashboard! Very intuitive and helpful.", "positive"},
		{"The metrics are exactly what our team needs.", "positive"},
		{"Love the new visualization features!", "positive"},
		{"This has improved our decision-making process significantly.", "positive"},
		{"The real-time updates are fantastic.", "positive"},

		// Neutral
		{"Could use more export options.", "neutral"},
		{"The data seems accurate but interface could be better.", "neutral"},
		{"It gets the job done.", "neutral"},
		{"Would like to see more customization options.", "neutral"},
		{"Good overall, but loading times could be improved.", "neutral"},

		// Negative
		{"Too many clicks to get to important data.", "negative"},
		{"Some metrics seem inaccurate.", "negative"},
		{"Mobile experience needs improvement.", "negative"},
		{"Hard to share reports with the team.", "negative"},
		{"Frequently times out with large datasets.", "negative"},
	}

	var allFeedback []models.Feedback
	for _, dashboard := range dashboards {
		// 10 feedback entries per dashboard
		for i := 0; i < 10; i++ {
			feedback := feedbackMessages[rand.Intn(len(feedbackMessages))]

			allFeedback = append(allFeedback, models.Feedback{
				DashboardID: dashboard.ID,
				Message:     feedback.message,
				Sentiment:   feedback.sentiment,
				CreatedAt:   time.Now().AddDate(0, 0, -rand.Intn(90)), // Random day in last 90 days
			})
		}
	}

	// Insert feedback
	for i := range allFeedback {
		db.Create(&allFeedback[i])
	}

	// 7. Additional random sales for current month
	log.Println("Adding current month sales...")
	currentMonthSales := []models.Sale{}
	for i := 0; i < 50; i++ {
		product := productList[rand.Intn(len(productList))]
		quantity := 1 + rand.Intn(10)

		currentMonthSales = append(currentMonthSales, models.Sale{
			ProductID: product.ID,
			Quantity:  quantity,
			Revenue:   float64(quantity) * product.Price,
			Date:      time.Now().AddDate(0, 0, -rand.Intn(30)),
		})
	}

	db.Create(&currentMonthSales)

	// Summary
	log.Println("Seeding complete!")
	log.Println("=== SEED SUMMARY ===")
	log.Printf("Categories: %d", len(categories))
	log.Printf("Products: %d", len(productList))

	var salesCount, metricsCount, feedbackCount int64
	db.Model(&models.Sale{}).Count(&salesCount)
	db.Model(&models.Metric{}).Count(&metricsCount)
	db.Model(&models.Feedback{}).Count(&feedbackCount)

	log.Printf("Sales: %d", salesCount)
	log.Printf("Dashboards: %d", len(dashboards))
	log.Printf("Metrics: %d", metricsCount)
	log.Printf("Feedback: %d", feedbackCount)
	log.Println("===================")
}
