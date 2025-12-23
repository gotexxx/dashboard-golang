package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {
	var data []models.Product
	config.DB.Find(&data)

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

func GetProduct(c *gin.Context) {
	var product models.Product
	id := c.Param("id")

	result := config.DB.First(&product, id)

	if result.Error != nil {
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": product,
	})
}

func AddProduct(c *gin.Context) {
	var newProduct models.Product
	if err := c.BindJSON(&newProduct); err != nil {
		return
	}

	var category models.Category
	if err := config.DB.First(&category, newProduct.CategoryID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category does not exist"})
		return
	}

	result := config.DB.Create(&newProduct)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product not inserted",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": "Product inserted successfully",
	})
}

func GetProductByCategory(c *gin.Context) {
	var products []models.Product
	categoryID := c.Param("categoryID")

	err := config.DB.Preload("Category").Where("category_id = ?", categoryID).Find(&products).Error

	if err != nil {
		c.JSON(500, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	if len(products) == 0 {
		c.JSON(404, gin.H{"message": "No product found in this category"})
		return
	}

	c.JSON(200, products)
}
