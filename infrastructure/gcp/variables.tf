variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "firebase_config_json" {
  description = "The Firebase configuration JSON"
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Allowed origins for CORS on the Cloud Storage bucket"
  type        = list(string)
  default     = ["*"]
} 