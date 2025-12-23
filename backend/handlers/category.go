package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	var categories []models.Category
	config.DB.Find(&categories)

	c.JSON(http.StatusOK, gin.H{
		"data": categories,
	})
}

func GetCategory(c *gin.Context) {
	var category models.Category
	id := c.Param("id")

	result := config.DB.First(&category, id)

	if result.Error != nil {
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "category not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": category,
	})
}

func AddCategory(c *gin.Context) {
	var newCategory models.Category
	if err := c.BindJSON(&newCategory); err != nil {
		return
	}
	result := config.DB.Create(&newCategory)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product not inserted",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": "Category inserted successfully",
	})
}
