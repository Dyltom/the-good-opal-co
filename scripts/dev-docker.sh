#!/bin/bash
#
# Development Docker Helper Script
# Quick commands for common Docker tasks
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  echo -e "${GREEN}[Rapid Sites]${NC} $1"
}

print_error() {
  echo -e "${RED}[Error]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[Warning]${NC} $1"
}

# Command: Start
start() {
  print_message "Starting development environment..."
  docker-compose up -d

  print_message "Waiting for services to be healthy..."
  sleep 5

  print_message "Services started!"
  print_message "App: http://localhost:3000"
  print_message "Admin: http://localhost:3000/admin"
  print_message "Database UI: http://localhost:8080"
  print_message ""
  print_message "View logs with: docker-compose logs -f"
}

# Command: Stop
stop() {
  print_message "Stopping services..."
  docker-compose down
  print_message "Services stopped!"
}

# Command: Restart
restart() {
  print_message "Restarting services..."
  docker-compose restart
  print_message "Services restarted!"
}

# Command: Logs
logs() {
  print_message "Showing logs (Ctrl+C to exit)..."
  docker-compose logs -f "$@"
}

# Command: Clean
clean() {
  print_warning "This will remove all volumes and data!"
  read -p "Are you sure? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_message "Cleaning up..."
    docker-compose down -v
    print_message "All data removed!"
  else
    print_message "Cancelled"
  fi
}

# Command: Reset
reset() {
  print_message "Resetting environment..."
  docker-compose down -v
  docker-compose up -d --build
  print_message "Environment reset complete!"
}

# Command: Shell
shell() {
  print_message "Opening shell in app container..."
  docker-compose exec app sh
}

# Command: DB Shell
db_shell() {
  print_message "Opening PostgreSQL shell..."
  docker-compose exec postgres psql -U rapidsites -d rapidsites
}

# Command: Status
status() {
  print_message "Service status:"
  docker-compose ps
}

# Main
case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    restart
    ;;
  logs)
    logs "${@:2}"
    ;;
  clean)
    clean
    ;;
  reset)
    reset
    ;;
  shell)
    shell
    ;;
  db)
    db_shell
    ;;
  status)
    status
    ;;
  *)
    echo "Rapid Sites - Docker Development Helper"
    echo ""
    echo "Usage: $0 {start|stop|restart|logs|clean|reset|shell|db|status}"
    echo ""
    echo "Commands:"
    echo "  start   - Start all services"
    echo "  stop    - Stop all services"
    echo "  restart - Restart all services"
    echo "  logs    - View logs (optional: specify service)"
    echo "  clean   - Stop and remove all volumes"
    echo "  reset   - Clean and rebuild from scratch"
    echo "  shell   - Open shell in app container"
    echo "  db      - Open PostgreSQL shell"
    echo "  status  - Show service status"
    exit 1
    ;;
esac
