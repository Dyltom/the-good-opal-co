# Docker Setup

This directory contains Docker configuration for running Rapid Sites in a containerized environment that mirrors production.

## Quick Start

```bash
# Start all services (database + app)
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Services

### PostgreSQL Database
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Credentials** (development only):
  - Database: `rapidsites`
  - User: `rapidsites`
  - Password: `rapidsites_dev_password`

### Next.js Application
- **Port**: 3000
- **Hot Reload**: Enabled (source mounted as volume)
- **URL**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

### Adminer (Database UI)
- **Port**: 8080
- **URL**: http://localhost:8080
- **Usage**: Database management and inspection

## Environment Variables

The docker-compose file sets up all required environment variables automatically:

- `DATABASE_URL`: PostgreSQL connection string
- `PAYLOAD_SECRET`: CMS secret key
- `NEXT_PUBLIC_APP_URL`: Public app URL
- `NEXT_PUBLIC_BASE_DOMAIN`: Base domain for multi-tenancy

## Volumes

### Persistent Data
- `postgres_data`: Database files (persists between restarts)
- `media_uploads`: Uploaded media files

### Development Volumes
- Source code mounted for hot reload
- `node_modules` and `.next` are excluded for performance

## Production Build

To test the production build locally:

```bash
# Build production image
docker build -t rapid-sites:prod --target production .

# Run production container
docker run -p 3000:3000 \
  -e DATABASE_URL=your-db-url \
  -e PAYLOAD_SECRET=your-secret \
  rapid-sites:prod
```

## Healthcheck

The app container includes a healthcheck that pings `/api/health`:
- Interval: 30s
- Timeout: 10s
- Retries: 3

Access health status: http://localhost:3000/api/health

## Database Initialization

On first run, `init-db.sql` creates necessary extensions:
- `uuid-ossp`: UUID generation
- `pg_trgm`: Trigram matching for search

## Troubleshooting

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in docker-compose.yml
ports:
  - '3001:3000'  # Use 3001 instead
```

### Database connection issues
```bash
# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Clear all data and restart
```bash
docker-compose down -v
docker-compose up --build
```

## Production Deployment (Coolify)

This setup mirrors production. For Coolify deployment:

1. Push code to GitHub
2. Connect repo to Coolify
3. Use `Dockerfile` (production target)
4. Set environment variables in Coolify dashboard
5. Deploy

The same Dockerfile works for both local and production!
