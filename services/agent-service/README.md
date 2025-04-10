# GrantCraft Agent Service

The Agent Service is the AI-powered brain of the GrantCraft system. It provides AI tools for grant proposal preparation through a unified API.

## Features

- **Document Generation**: Create structured text documents for grant proposals
- **Research Tools**: Research topics and analyze funding sources
- **Timeline Generation**: Create project timelines and Gantt charts
- **Budget Generation**: Generate detailed budgets and justifications
- **File Management**: Create and organize files for proposals
- **Image Generation**: Create visualizations and diagrams

## Architecture

The Agent Service uses a tool-based architecture:

1. **Tool Router**: Selects and orchestrates appropriate tools based on user requests
2. **Individual Tools**: Specialized modules for specific tasks (document generation, research, etc.)
3. **Vertex AI Integration**: Uses Google's Vertex AI Gemini model for AI capabilities
4. **Prompt Management**: Centralized repository of versioned prompts

## Setup and Installation

### Prerequisites

- Python 3.9+
- Google Cloud Platform account with Vertex AI API enabled
- Google Cloud credentials configured

### Installation

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```
   export GCP_PROJECT_ID="your-gcp-project-id"
   export GCP_LOCATION="us-central1"
   export VERTEX_MODEL="gemini-1.0-pro"
   ```

### Running the Service

```
cd services/agent-service
uvicorn app.main:app --reload
```

The service will be available at http://localhost:8000

## API Endpoints

### Process Request

```
POST /api/agent/process
```

Process a task using the AI agent.

**Request:**
```json
{
  "task": "Generate an executive summary for a research proposal on climate change adaptation",
  "user_id": "user123",
  "project_id": "project456",
  "parameters": {
    "max_length": 500,
    "style": "academic"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "results": [
    {
      "tool": "document_generation",
      "method": "generate_document",
      "result": "Executive summary content...",
      "status": "success"
    }
  ],
  "errors": [],
  "message": "Completed 1 of 1 operations"
}
```

### Health Check

```
GET /api/agent/health
```

Check the health status of the service.

### List Tools

```
GET /api/agent/tools
```

List all available AI tools in the system.

## Development

### Adding a New Tool

1. Create a new tool class in `app/tools/`
2. Register the tool in the `AgentHandler` class in `app/agent_handler.py`
3. Add any necessary prompt templates in `app/prompts/`

### Testing

Run the tests using pytest:

```
pytest
``` 