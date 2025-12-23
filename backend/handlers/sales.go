package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetSales(c *gin.Context) {
	var sales []models.Sale
	config.DB.Find(&sales)

	c.JSON(http.StatusOK, gin.H{
		"data": sales,
	})
}
func GetSaleById(c *gin.Context) {
	var sale []models.Sale
	id := c.Param("id")

	c.JSON(http.StatusOK, gin.H{
		"data": sale,
	})

	result := config.DB.First(&sale, id)
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
		"data": sale,
	})
}
