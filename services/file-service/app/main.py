from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Import routers
from routers import files

# Load environment variables
load_dotenv()

# Configuration
API_PREFIX = os.getenv("API_PREFIX", "")
BACKEND_CORS_ORIGINS = os.getenv(
    "BACKEND_CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:8080"
).split(",")

app = FastAPI(
    title="GrantCraft File Service",
    description="File Service for the GrantCraft system",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(files.router, prefix=API_PREFIX)

@app.get("/health")
async def health_check():
    """
    Health check endpoint for the File Service
    """
    return {"status": "ok", "service": "file-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 