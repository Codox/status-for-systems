package responses

import (
	"api/models"
	"time"
)

type GetSystemGroupResponse struct {
	GroupStatus string          `json:"groupStatus"`
	UUID        string          `json:"uuid"`
	Name        string          `json:"name"`
	Systems     []models.System `json:"systems"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}
