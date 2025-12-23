package handlers

import (
	"net/http"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func GetDashboard(c *gin.Context) {
	var data []models.Dashboard
	config.DB.Preload("Metrics").Preload("Feedback").Find(&data)

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}
