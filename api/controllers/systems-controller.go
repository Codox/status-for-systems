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

  if len(systems) == 0 {
    context.JSON(http.StatusOK, gin.H{"data": []string{}})
  } else {
    context.JSON(http.StatusOK, gin.H{"data": systems})
  }
}
