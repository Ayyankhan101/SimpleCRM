import os

# Server socket
bind = "0.0.0.0:5000"

# Worker processes
# Rule of thumb: 2 * CPU cores + 1
workers = int(os.environ.get("GUNICORN_WORKERS", 4))
worker_class = "gthread"
threads = int(os.environ.get("GUNICORN_THREADS", 2))
worker_tmp_dir = "/dev/shm"

# Timeout
timeout = 120
graceful_timeout = 30
keepalive = 5

# Restart workers periodically to prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "crm-analytics"

# Preload app for better memory usage
preload_app = True

# Server mechanics
daemon = False
pidfile = None
tmp_upload_dir = None

# SSL (uncomment for production)
# certfile = "/etc/ssl/certs/server.crt"
# keyfile = "/etc/ssl/private/server.key"
