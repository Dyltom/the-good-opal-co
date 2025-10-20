-- Database initialization script
-- This runs automatically when the postgres container is first created

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database (already created by POSTGRES_DB env var)
-- Just ensure it's ready

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rapidsites TO rapidsites;

-- Success message
SELECT 'Database initialized successfully!' AS status;
