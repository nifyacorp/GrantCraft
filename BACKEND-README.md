# GrantCraft Backend

This is the backend service for GrantCraft, built with FastAPI and Python.

## Technology Stack

- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database ORM**: SQLAlchemy
- **Package Manager**: Poetry
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Python 3.9+
- Poetry
- MySQL database

### Setting Up the Environment

1. Clone the repository and navigate to the backend directory:

```bash
cd platform
```

2. Install dependencies with Poetry:

```bash
poetry install
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file to add your configuration:

```
DATABASE_URL=mysql://username:password@hostname:port/database
SECRET_KEY=your_secret_key
```

### Development Server

Run the development server:

```bash
poetry run uvicorn reworkd_platform.__main__:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get access token

### Agent

- `POST /api/agent/start`: Start a new agent
- `POST /api/agent/execute`: Execute a task with an agent

### Monitoring

- `GET /api/monitoring/health`: Check service health
- `GET /api/monitoring/ping`: Simple ping endpoint

#### Database Monitoring (Diagnostic)

- `GET /api/monitoring/database/connection`: Check database connection
- `GET /api/monitoring/database/tables`: List all database tables
- `GET /api/monitoring/database/describe/{table_name}`: Get table schema
- `GET /api/monitoring/database/required-tables`: Check for required tables
- `GET /api/monitoring/database/check-all`: Comprehensive database check

## Docker Deployment

Build the Docker image:

```bash
docker build -t grantcraft-backend .
```

Run the container:

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL=mysql://username:password@hostname:port/database \
  -e SECRET_KEY=your_secret_key \
  grantcraft-backend
```

## Testing

Run the tests with pytest:

```bash
poetry run pytest
```

## Database Information

The backend connects to a MySQL database configured via the `DATABASE_URL` environment variable. The database schema is managed by:

1. The frontend's Prisma ORM (for NextAuth.js tables)
2. Backend SQLAlchemy models (for agent functionality)

## Troubleshooting

### Database Connection Issues

Check your database connection with:

```bash
curl http://localhost:8000/api/monitoring/database/connection
```

Or in production:

```bash
curl https://grantcraft-backend-320165158819.us-central1.run.app/api/monitoring/database/connection
```

### Missing Tables

Check if all required tables exist:

```bash
curl http://localhost:8000/api/monitoring/database/required-tables
```

If tables are missing, run the Prisma migrations from the frontend:

```bash
cd ../next
npx prisma db push
```

## Directory Structure

- `/reworkd_platform`: Main application package
  - `/db`: Database models and CRUD operations
  - `/schemas`: Pydantic schemas for request/response validation
  - `/services`: Business logic and external services
  - `/web`: Web API including routes and controllers