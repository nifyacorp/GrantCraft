# GrantCraft GCP Project Resources

This document summarizes the Google Cloud Platform resources used in the GrantCraft project.

## Project Information

- **Project ID:** grancraft-final-20240630
- **Project Name:** GranCraft Final

## Cloud Services

### Firebase Services
- Firebase Rules API enabled
- Firestore database created (standard edition, free tier)

### Storage
- Primary storage bucket: `gs://grancraft-final-20240630-files/`
- Cloud Run sources bucket: `gs://run-sources-grancraft-final-20240630-us-central1/`

### Deployed Services
- Frontend: `https://frontend-801375954462.us-central1.run.app`
- API Gateway: `https://api-gateway-801375954462.us-central1.run.app`

### Region
- Primary deployment region: `us-central1`

## Firebase Configuration
The following Firebase configuration is used for authentication and storage:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAqBWQXbZCDSvHB0ufN-1KHPz2GWkO3nEY",
  authDomain: "grancraft-final-20240630.firebaseapp.com",
  projectId: "grancraft-final-20240630",
  storageBucket: "grancraft-final-20240630-files",
  messagingSenderId: "801375954462",
  appId: "1:801375954462:web:e8b9854c29a3d91c7b4d75"
};
```

## Deployment Architecture
The application follows a microservices architecture with the following components:
- Frontend (Next.js)
- API Gateway
- Various backend services deployed on Cloud Run
- Firebase for authentication
- Firestore for database
- Cloud Storage for file storage 