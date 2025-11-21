# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    netcat-openbsd \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
# Proses ini bakal agak lama di bagian 'Building wheel for dlib', sabar ya bang
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py api_analytics.py api_auth.py api_master.py extensions.py models.py ./
COPY data.sql ./
COPY static/ static/
COPY templates/ templates/


# Add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 5000
EXPOSE 5000

# Set entrypoint and default command
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]