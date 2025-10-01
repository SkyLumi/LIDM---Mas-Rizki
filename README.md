# Flask Game Application - Docker Setup

This is a Flask web application featuring three games: Ice Cream (Eskrim), Bubbles (Gelembung), and Board (Papan).

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system
- **Docker Desktop must be running** (for Windows/Mac users)

> **Note:** Before running any Docker commands, make sure Docker Desktop is started. You can verify Docker is running by executing: `docker --version`

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker Only

1. **Build the Docker image:**
   ```bash
   docker build -t flask-game-app .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 5000:5000 --name flask-game-app flask-game-app
   ```

3. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

4. **Stop and remove the container:**
   ```bash
   docker stop flask-game-app
   docker rm flask-game-app
   ```

## Available Routes

- `/` - Main menu page
- `/eskrim-game` - Ice cream game
- `/gelembung-game` - Bubble game
- `/papan-game` - Board game

## Development Mode

To enable hot-reload for development, uncomment the volume mounts in `docker-compose.yml`:

```yaml
volumes:
  - ./app.py:/app/app.py
  - ./static:/app/static
  - ./templates:/app/templates
```

Then restart the container:
```bash
docker-compose down
docker-compose up
```

## Docker Commands Reference

### View running containers:
```bash
docker ps
```

### View container logs:
```bash
docker-compose logs -f
```

### Rebuild the image:
```bash
docker-compose up --build
```

### Remove all containers and images:
```bash
docker-compose down --rmi all
```

## Project Structure

```
.
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker image configuration
├── docker-compose.yml    # Docker Compose configuration
├── .dockerignore         # Files to exclude from Docker build
├── static/               # Static assets (images, fonts)
│   ├── eskrim_img/
│   ├── gelembung_img/
│   ├── papan_img/
│   ├── img/
│   └── font/
└── templates/            # HTML templates
    ├── menu.html
    ├── eskrim.html
    ├── gelembung.html
    └── papan.html
```

## Troubleshooting

### Port already in use
If port 5000 is already in use, you can change it in `docker-compose.yml`:
```yaml
ports:
  - "8080:5000"  # Change 8080 to any available port
```

### Container won't start
Check the logs:
```bash
docker-compose logs
```

### Rebuild from scratch
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
