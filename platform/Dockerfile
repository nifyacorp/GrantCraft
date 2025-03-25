FROM python:3.11-slim-buster as prod

RUN apt-get update && apt-get install -y \
  default-libmysqlclient-dev \
  gcc \
  pkg-config \
  openjdk-11-jdk \
  build-essential \
  netcat-traditional \
  && rm -rf /var/lib/apt/lists/*

RUN pip install poetry==1.4.2

# Configuring poetry
RUN poetry config virtualenvs.create false

# Copying requirements of a project
COPY pyproject.toml /app/src/
WORKDIR /app/src

# Installing requirements with updated dependencies
RUN pip cache purge && \
    poetry install --only main

# Removing gcc
RUN apt-get purge -y \
  g++ \
  gcc \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

# Copying actual application
COPY . /app/src/
RUN poetry install --only main --no-cache

# Create wrapper script for Cloud Run
RUN echo '#!/bin/sh\nexport REWORKD_PLATFORM_PORT=$(echo $PORT | tr -dc "0-9")\nexec /usr/local/bin/python -m reworkd_platform' > /app/wrapper.sh && \
    chmod +x /app/wrapper.sh

CMD ["/app/wrapper.sh"]

FROM prod as dev

RUN poetry install
