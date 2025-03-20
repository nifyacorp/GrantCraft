# GitHub Secrets Setup

## Backend Repository Secrets

Add these secrets to the GrantCraft-backend repository on GitHub:

- `WIF_PROVIDER`: Workload Identity Federation provider
- `WIF_SERVICE_ACCOUNT`: Service account email for GCP
- `CLOUD_SQL_CONNECTION_NAME`: The connection name of your Cloud SQL instance
- `DB_USER`: Database username (reworkd_platform)
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (reworkd_platform)
- `OPENAI_API_KEY`: Your OpenAI API key
- `FRONTEND_URL`: Frontend URL (https://grant-craft.netlify.app)

## Setting up Workload Identity Federation

1. Enable the IAM Credential API:
```bash
gcloud services enable iamcredentials.googleapis.com
```

2. Create a Workload Identity Pool:
```bash
gcloud iam workload-identity-pools create "github-actions-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

3. Create a Workload Identity Provider:
```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

4. Get the Workload Identity Provider resource name:
```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --format="value(name)"
```

5. Create a service account:
```bash
gcloud iam service-accounts create "github-actions-sa" \
  --display-name="GitHub Actions Service Account"
```

6. Grant necessary roles to the service account:
```bash
gcloud projects add-iam-policy-binding grantcraft \
  --member="serviceAccount:github-actions-sa@grantcraft.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding grantcraft \
  --member="serviceAccount:github-actions-sa@grantcraft.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding grantcraft \
  --member="serviceAccount:github-actions-sa@grantcraft.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding grantcraft \
  --member="serviceAccount:github-actions-sa@grantcraft.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

7. Allow the GitHub repository to impersonate the service account:
```bash
gcloud iam service-accounts add-iam-policy-binding "github-actions-sa@grantcraft.iam.gserviceaccount.com" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/nifyacorp/GrantCraft-backend" \
  --role="roles/iam.workloadIdentityUser"
```

Replace PROJECT_NUMBER with your Google Cloud project number.
