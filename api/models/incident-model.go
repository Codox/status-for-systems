package models

import "time"

type IncidentStatus struct {
	ID        uint64    `gorm:"primaryKey; column:id" json:"-"`
	UUID      string    `gorm:"column:uuid" json:"uuid"`
	Name      string    `gorm:"column:name" json:"name"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

type IncidentUpdate struct {
	ID        uint64    `gorm:"primaryKey; column:id" json:"-"`
	UUID      string    `gorm:"column:uuid" json:"uuid"`
	Text      string    `gorm:"column:text;type:text" json:"text"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt time.Time `gorm:"column:deleted_at" json:"deletedAt"`
}

type Incident struct {
	ID          uint64    `gorm:"primaryKey; column:id" json:"-"`
	UUID        string    `gorm:"column:uuid" json:"uuid"`
	Title       string    `gorm:"column:title" json:"title"`
	Description string    `gorm:"column:description;type:text" json:"description"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

type IncidentSystem struct {
	ID         uint64    `gorm:"primaryKey; column:id" json:"-"`
	UUID       string    `gorm:"column:uuid" json:"uuid"`
	SystemID   uint64    `gorm:"column:system_id" json:"-"`
	IncidentID uint64    `gorm:"column:incident_id" json:"-"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updatedAt"`
}
