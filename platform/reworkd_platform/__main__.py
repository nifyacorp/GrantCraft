import uvicorn

from reworkd_platform.settings import settings


def main() -> None:
    """Entrypoint of the application."""
    # On Cloud Run, listen on all interfaces (0.0.0.0) to accept traffic
    # This is crucial for Cloud Run's health checks
    host = "0.0.0.0" if settings.environment == "production" else settings.host
    
    uvicorn.run(
        "reworkd_platform.web.application:get_app",
        workers=settings.workers_count,
        host=host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
        factory=True,
    )


if __name__ == "__main__":
    main()
