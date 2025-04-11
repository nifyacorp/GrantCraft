FROM python:3.9-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (maintaining app directory structure)
COPY app/ ./app/

# Set environment variable for port
ENV PORT=8080

# Run the application, fixing the import structure
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT 