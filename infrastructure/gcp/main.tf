terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  backend "gcs" {
    bucket = "grant-craft-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "aiplatform.googleapis.com",
    "secretmanager.googleapis.com"
  ])
  
  project = var.project_id
  service = each.key
  
  disable_on_destroy = false
}

# Cloud Storage bucket for files
resource "google_storage_bucket" "files_bucket" {
  name     = "${var.project_id}-files"
  location = var.region
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = var.allowed_origins
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
  
  lifecycle_rule {
    condition {
      age = 30 # days
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
}

# Service account for Vertex AI
resource "google_service_account" "vertex_ai_user" {
  account_id   = "vertex-ai-user"
  display_name = "Vertex AI User"
}

# IAM binding for Vertex AI service account
resource "google_project_iam_binding" "vertex_ai_user_binding" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  
  members = [
    "serviceAccount:${google_service_account.vertex_ai_user.email}"
  ]
}

# Secrets for Firebase config
resource "google_secret_manager_secret" "firebase_config" {
  secret_id = "firebase-config"
  
  replication {
    automatic = true
  }
}

# Secret version for Firebase config
resource "google_secret_manager_secret_version" "firebase_config_version" {
  secret = google_secret_manager_secret.firebase_config.id
  
  secret_data = var.firebase_config_json
}

# Secret access for Vertex AI service account
resource "google_secret_manager_secret_iam_binding" "firebase_config_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.firebase_config.secret_id
  role      = "roles/secretmanager.secretAccessor"
  
  members = [
    "serviceAccount:${google_service_account.vertex_ai_user.email}"
  ]
}

# Cloud Run service for frontend
resource "google_cloud_run_service" "frontend" {
  name     = "frontend-service"
  location = var.region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/frontend:latest"
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = "https://${google_cloud_run_service.api_gateway.status[0].url}/api"
        }
        
        resources {
          limits = {
            cpu    = "1"
            memory = "1Gi"
          }
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_service.services["run.googleapis.com"]
  ]
}

# Cloud Run service for API Gateway
resource "google_cloud_run_service" "api_gateway" {
  name     = "api-gateway"
  location = var.region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/api-gateway:latest"
        
        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        
        env {
          name  = "GCP_LOCATION"
          value = var.region
        }
        
        resources {
          limits = {
            cpu    = "1"
            memory = "1Gi"
          }
        }
      }
      
      service_account_name = google_service_account.vertex_ai_user.email
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_service.services["run.googleapis.com"]
  ]
}

# Make frontend publicly accessible
resource "google_cloud_run_service_iam_member" "frontend_public" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Make API Gateway publicly accessible
resource "google_cloud_run_service_iam_member" "api_gateway_public" {
  service  = google_cloud_run_service.api_gateway.name
  location = google_cloud_run_service.api_gateway.location
  role     = "roles/run.invoker"
  member   = "allUsers"
} 