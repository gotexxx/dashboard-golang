package models

import "time"

type Dashboard struct {
	ID          uint `gorm:"primaryKey"`
	Name        string
	Description string
	CreatedAt   time.Time
	Metrics     []Metric
	Feedback    []Feedback
}

type Metric struct {
	ID          uint `gorm:"primaryKey"`
	DashboardID uint
	Name        string
	Value       float64
	Unit        string
	CreatedAt   time.Time
}

type Feedback struct {
	ID          uint `gorm:"primaryKey"`
	DashboardID uint
	Message     string
	Sentiment   string
	CreatedAt   time.Time
}

type Sale struct {
	ID        uint `gorm:"primaryKey"`
	ProductID uint
	Product   Product
	Quantity  int
	Revenue   float64
	Date      time.Time
}

type Product struct {
	ID         uint `gorm:"primaryKey"`
	Name       string
	CategoryID uint
	Category   Category
	Price      float64
	CreatedAt  time.Time
	Sales      []Sale
}

type Category struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"unique;not null"`
	CreatedAt time.Time
	Products  []Product
}
