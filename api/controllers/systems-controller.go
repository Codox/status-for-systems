package controllers

import (
	"api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

func GetSystems(context *gin.Context) {
	var systems []models.System

	db, _ := context.MustGet("db").(*gorm.DB)
	db.Preload("SystemGroup").Find(&systems)

	context.JSON(http.StatusOK, gin.H{"data": systems})
}

func GetGroups(context *gin.Context) {
	var systemGroups []models.SystemGroup

	db, _ := context.MustGet("db").(*gorm.DB)
	db.Find(&systemGroups)

	context.JSON(http.StatusOK, gin.H{"data": systemGroups})
}
