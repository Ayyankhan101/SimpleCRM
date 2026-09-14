FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies for psycopg2 and other C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r crmuser && useradd -r -g crmuser -d /app -s /sbin/nologin crmuser

COPY --from=builder /install /usr/local

COPY . .

# Create instance directory for SQLite (dev fallback)
RUN mkdir -p /app/instance && chown -R crmuser:crmuser /app

ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 5000

USER crmuser

CMD ["gunicorn", "-c", "gunicorn.conf.py", "run:app"]
