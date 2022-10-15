package models

import (
	"time"
)

type System struct {
	ID        uint64    `gorm:"primaryKey; column:id" json:"-"`
	UUID      string    `gorm:"column:uuid" json:"uuid"`
	Name      string    `gorm:"column:name" json:"name"`
	GroupID   uint64    `gorm:"column:group_id" json:"-"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

type SystemGroup struct {
	ID        uint64    `gorm:"primaryKey; column:id" json:"-"`
	UUID      string    `gorm:"column:uuid" json:"uuid"`
	Name      string    `gorm:"column:name" json:"name"`
	Systems   []System  `gorm:"foreignKey:GroupID" json:"systems,omitempty"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}
