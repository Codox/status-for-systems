package main

import (
  "embed"
  "fmt"
  "os"
)

var (
  //go:embed migrations/*.sql
  migrations  embed.FS
)

func main() {
	fmt.Println("Working123")

  /**
    Setup database connection
   */
  dbConnectionString := fmt.Sprintf(
    "mysql://user=%s:password=%s@tcp(host=%s:port=%d)/%s?sslmode=disable",
    os.Getenv("DB_USER"),
    os.Getenv("DB_PASS"),
    os.Getenv("DB_HOST"),
    3306,
    os.Getenv("DB_NAME"))

  fmt.Println(dbConnectionString)
}
