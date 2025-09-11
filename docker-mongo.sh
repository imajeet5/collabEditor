#!/bin/bash

# Docker management script for Collaborative Text Editor

case "$1" in
  start)
    echo "Starting MongoDB with Docker..."
    docker-compose up -d
    echo "MongoDB is starting up. It will be available at localhost:27017"
    echo "MongoDB Express (Web UI) will be available at http://localhost:8081"
    echo "Default credentials for MongoDB Express: admin / admin123"
    ;;
  stop)
    echo "Stopping MongoDB..."
    docker-compose down
    ;;
  restart)
    echo "Restarting MongoDB..."
    docker-compose down
    docker-compose up -d
    ;;
  logs)
    echo "Showing MongoDB logs..."
    docker-compose logs -f mongodb
    ;;
  status)
    echo "Docker containers status:"
    docker-compose ps
    ;;
  clean)
    echo "Cleaning up Docker containers and volumes..."
    docker-compose down -v
    docker system prune -f
    ;;
  shell)
    echo "Opening MongoDB shell..."
    docker exec -it collaborative-editor-mongo mongosh collaborative-editor -u editoruser -p editorpass123
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs|status|clean|shell}"
    echo ""
    echo "Commands:"
    echo "  start   - Start MongoDB container"
    echo "  stop    - Stop MongoDB container"
    echo "  restart - Restart MongoDB container"
    echo "  logs    - Show MongoDB logs"
    echo "  status  - Show container status"
    echo "  clean   - Remove containers and volumes"
    echo "  shell   - Open MongoDB shell"
    exit 1
    ;;
esac
