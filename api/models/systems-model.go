package models

import (
	"gorm.io/gorm"
	"time"
)

type System struct {
	gorm.Model

	ID          uint64      `gorm:"primaryKey; column:id"`
	Name        string      `gorm:"column:name"`
	GroupID     uint64      `gorm:"column:group_id"`
	SystemGroup SystemGroup `gorm:"foreignKey:GroupID"`
	CreatedAt   time.Time   `gorm:"column:created_at"`
	UpdatedAt   time.Time   `gorm:"column:updated_at"`
}

type SystemGroup struct {
	gorm.Model

	ID        uint64    `gorm:"primaryKey"`
	Name      string    `gorm:"column:name"`
	Systems   []System  `gorm:"foreignKey:GroupID"`
	CreatedAt time.Time `gorm:"column:created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at"`
}
