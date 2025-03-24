# OWL Development Guide

## Build/Run Commands
- **Install dependencies**: `uv pip install -e .` or `pip install -r requirements.txt --use-pep517`
- **Start web app**: `python owl/webapp.py` (English) or `python owl/webapp_zh.py` (Chinese)
- **Run example**: `python examples/run.py` or `python examples/run_mini.py`
- **MCP setup**: `npx -y @wonderwhy-er/desktop-commander setup --force-file-protocol`

## Code Style Guidelines
- **Python version**: 3.10-3.12
- **Imports**: System libraries first, third-party second, local imports last
- **Type hints**: Use type annotations for parameters and return values 
- **Naming**: snake_case for functions/variables, PascalCase for classes, UPPER_SNAKE_CASE for constants
- **Error handling**: Use try/except with specific exceptions, log errors with contextual information
- **Documentation**: Follow Python docstring conventions
- **License headers**: Include Apache 2.0 license header in all files

## Development Workflow
- File structure follows CAMEL framework conventions
- License headers are automatically managed by `licenses/update_license.py`
- Logging is implemented with the CAMEL logger system `from camel.logger import get_logger`
- Mypy is configured with relaxed type checking (see pyproject.toml)