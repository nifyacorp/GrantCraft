FROM python:3.9-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (keep directory structure)
COPY app/ app/

# Set environment variables
ENV PORT=8080

# Expose port for Cloud Run
EXPOSE 8080

# Run the application with correct module path and PORT variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"] 