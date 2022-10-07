package controllers

import (
	"api/models"
	"fmt"
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

func GetSystem(context *gin.Context) {
	var system models.System

	db, _ := context.MustGet("db").(*gorm.DB)
	db.Preload("SystemGroup").First(&system, "uuid = ?", context.Param("uuid"))

	fmt.Println(system)

	if system.ID == 0 {
		context.JSON(http.StatusNotFound, gin.H{"data": nil})
		return
	}

	context.JSON(http.StatusOK, gin.H{"data": system})
}

func GetGroups(context *gin.Context) {
	var systemGroups []models.SystemGroup

	db, _ := context.MustGet("db").(*gorm.DB)
	db.Find(&systemGroups)

	context.JSON(http.StatusOK, gin.H{"data": systemGroups})
}

func GetGroup(context *gin.Context) {
	var systemGroup models.SystemGroup

	db, _ := context.MustGet("db").(*gorm.DB)
	db.Preload("Systems").First(&systemGroup, "uuid = ?", context.Param("uuid"))

	if systemGroup.ID == 0 {
		context.JSON(http.StatusNotFound, gin.H{"data": nil})
		return
	}

	context.JSON(http.StatusOK, gin.H{"data": systemGroup})
}
