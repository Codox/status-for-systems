package main

import (
  "api/controllers"
  "embed"
  "fmt"
  "github.com/gin-gonic/gin"
  "github.com/golang-migrate/migrate/v4"
  _ "github.com/golang-migrate/migrate/v4/database/mysql"
  "github.com/golang-migrate/migrate/v4/source/iofs"
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
  "os"
  "strings"
)

var (
  //go:embed migrations/*.sql
  migrationsDirectory  embed.FS
)

func main() {
	fmt.Println("Working123")

  /**
    Setup database connection
   */
  dbConnectionString := fmt.Sprintf(
    "mysql://%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True",
    os.Getenv("DB_USER"),
    os.Getenv("DB_PASS"),
    os.Getenv("DB_HOST"),
    3306,
    os.Getenv("DB_NAME"))


  // Run migrations for the database
  migrationsDirectory, _ := iofs.New(migrationsDirectory, "migrations")

  migrations, migrationsErr := migrate.NewWithSourceInstance(
    "iofs", migrationsDirectory, dbConnectionString)

  if migrationsErr != nil {
    panic(migrationsErr)
  }

  migrationsErr = migrations.Up()

  if migrationsErr != nil {
    // panic(migrationsErr)
  }

  db, dbErr := gorm.Open(mysql.Open(strings.ReplaceAll(dbConnectionString, "mysql://", "")), &gorm.Config{})

  if dbErr != nil {
    panic(dbErr)
  }

  // Setup router
  router := gin.Default()

  // Setup database context
  router.Use(func(context *gin.Context) {
    context.Set("db", db)
    context.Next()
  })

  router.GET("/systems", controllers.GetSystems)

  router.Run(":8080")
}
