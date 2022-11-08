package models

import "time"

type IncidentStatus struct {
  ID        uint64    `gorm:"primaryKey; column:id" json:"-"`
  UUID      string    `gorm:"column:uuid" json:"uuid"`
  Name      string    `gorm:"column:name" json:"name"`
  CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
  UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

type Incident struct {

}
