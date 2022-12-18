package responses

import "api/models"

type GetSystemGroupsResponse struct {
}

type GetSystemGroupResponse struct {
  GroupStatus string          `json:"groupStatus"`
  UUID        string          `json:"uuid"`
  Name        string          `json:"name"`
  Systems     []models.System `json:"systems"`
}
