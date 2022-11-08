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
	db.Find(&systems)

	context.JSON(http.StatusOK, gin.H{"data": systems})
}

func GetSystem(context *gin.Context) {
	var system models.System

	db, _ := context.MustGet("db").(*gorm.DB)
	if db.Preload("SystemGroup").First(&system, "uuid = ?", context.Param("uuid")).Error != nil {
    context.JSON(http.StatusInternalServerError, gin.H{"message": "Something went wrong. Please try again later"})
    return
  }

	if system.ID == 0 {
		context.JSON(http.StatusNotFound, gin.H{"data": nil})
		return
	}

	context.JSON(http.StatusOK, gin.H{"data": system})
}

func GetSystemGroups(context *gin.Context) {
	var systemGroups []models.SystemGroup

	db, _ := context.MustGet("db").(*gorm.DB)
	db.Find(&systemGroups)

	context.JSON(http.StatusOK, gin.H{"data": systemGroups})
}

func GetSystemGroup(context *gin.Context) {
	var systemGroup models.SystemGroup

	db, _ := context.MustGet("db").(*gorm.DB)
	db.Preload("Systems").First(&systemGroup, "uuid = ?", context.Param("uuid"))

	if systemGroup.ID == 0 {
		context.JSON(http.StatusNotFound, gin.H{"data": nil})
		return
	}

	context.JSON(http.StatusOK, gin.H{"data": systemGroup})
}
