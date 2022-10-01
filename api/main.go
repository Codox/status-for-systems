package main

import (
  "embed"
  "fmt"
  "github.com/golang-migrate/migrate/v4"
  _ "github.com/golang-migrate/migrate/v4/database/mysql"
  "github.com/golang-migrate/migrate/v4/source/iofs"
  "os"
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
    "mysql://%s:%s@tcp(%s:%d)/%s",
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
}
