package models

import (
	"gorm.io/gorm"
	"time"
)

type System struct {
	gorm.Model
}

type SystemGroup struct {
	gorm.Model

	ID        uint64    `gorm:"primaryKey"`
	Name      string    `gorm:"column:name"`
	CreatedAt time.Time `gorm:"column:created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at"`
}
