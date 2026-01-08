# Deployment Guide - EMS Supply Tracker

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Docker 20.10+ and Docker Compose 2.0+
- Node.js 20.x (for local development)
- PostgreSQL 15+ (if not using Docker)
- Git

### Optional
- SendGrid account for email functionality
- SSL certificates for HTTPS in production

## Development Setup

### Option 1: Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd swazzers
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

4. View logs:
```bash
docker-compose logs -f
```

5. Stop all services:
```bash
docker-compose down
```

### Option 2: Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials

5. Run database migrations:
```bash
npm run migrate:latest
```

6. Seed demo data:
```bash
npm run seed:run
```

7. Start development server:
```bash
npm run dev
```

The API will be available at http://localhost:3001

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` to point to your backend API

5. Start development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

1. Create a production docker-compose file:
```bash
cp docker-compose.yml docker-compose.prod.yml
```

2. Update environment variables for production in `docker-compose.prod.yml`

3. Build and start:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Production Deployment

### Backend Production Build

1. Set environment variables:
```bash
export NODE_ENV=production
export DB_HOST=your-db-host
export DB_USER=your-db-user
export DB_PASSWORD=your-db-password
export DB_NAME=your-db-name
export JWT_SECRET=your-strong-secret-key
export JWT_REFRESH_SECRET=your-strong-refresh-secret
```

2. Install dependencies:
```bash
cd backend
npm ci --production
```

3. Run migrations:
```bash
npm run migrate:latest
```

4. Start server:
```bash
npm start
```

### Frontend Production Build

1. Set environment variable:
```bash
export NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

2. Install dependencies:
```bash
cd frontend
npm ci --production
```

3. Build application:
```bash
npm run build
```

4. Start server:
```bash
npm start
```

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=ems_user
DB_PASSWORD=secure-password-here
DB_NAME=ems_supply_tracker

# JWT Security
JWT_SECRET=generate-a-strong-random-secret-here
JWT_REFRESH_SECRET=generate-another-strong-random-secret-here

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

## Database Setup

### PostgreSQL Configuration

1. Create database:
```sql
CREATE DATABASE ems_supply_tracker;
CREATE USER ems_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE ems_supply_tracker TO ems_user;
```

2. Run migrations:
```bash
cd backend
npm run migrate:latest
```

3. (Optional) Seed demo data:
```bash
npm run seed:run
```

### Database Backups

```bash
# Backup
pg_dump -U ems_user ems_supply_tracker > backup_$(date +%Y%m%d).sql

# Restore
psql -U ems_user ems_supply_tracker < backup_20240101.sql
```

## SSL/HTTPS Setup

### Using Nginx Reverse Proxy

1. Install Nginx and Certbot:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. Create Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. Obtain SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Process Management

### Using PM2

1. Install PM2:
```bash
npm install -g pm2
```

2. Start backend:
```bash
cd backend
pm2 start src/server.js --name ems-backend
```

3. Start frontend:
```bash
cd frontend
pm2 start npm --name ems-frontend -- start
```

4. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

5. Monitor processes:
```bash
pm2 status
pm2 logs
pm2 monit
```

## Health Checks

### Backend Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-08T12:00:00.000Z"
}
```

### Database Health Check
```bash
psql -U ems_user -d ems_supply_tracker -c "SELECT NOW();"
```

## Troubleshooting

### Issue: Database connection failed

**Solution:**
1. Check database is running:
```bash
docker-compose ps postgres
# or
sudo systemctl status postgresql
```

2. Verify credentials in `.env`
3. Check firewall rules

### Issue: Frontend cannot connect to backend

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
2. Check CORS settings in backend `server.js`
3. Ensure backend is running: `curl http://localhost:3001/health`

### Issue: Migrations fail

**Solution:**
1. Check database user permissions
2. Verify database exists
3. Run migrations manually:
```bash
cd backend
npx knex migrate:latest
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port
sudo lsof -i :3001

# Kill process
kill -9 <PID>
```

## Monitoring and Logs

### View Docker logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### View PM2 logs:
```bash
pm2 logs ems-backend
pm2 logs ems-frontend
```

### Database logs:
```bash
# Docker
docker-compose logs -f postgres

# Native PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## Security Best Practices

1. **Change default credentials** in production
2. **Use strong JWT secrets** (at least 32 characters, random)
3. **Enable SSL/HTTPS** for all connections
4. **Set up firewall** to limit database access
5. **Regular backups** of database
6. **Update dependencies** regularly
7. **Monitor logs** for suspicious activity
8. **Implement rate limiting** (already configured)
9. **Use environment variables** for all secrets
10. **Enable database SSL** in production

## Scaling

### Horizontal Scaling

1. Use load balancer (Nginx, HAProxy)
2. Run multiple backend instances
3. Use Redis for session storage
4. Use connection pooling for database

### Database Scaling

1. Enable PostgreSQL replication
2. Use read replicas for reports
3. Implement connection pooling
4. Regular database optimization

## Maintenance

### Update Dependencies

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

### Database Maintenance

```bash
# Vacuum database
psql -U ems_user -d ems_supply_tracker -c "VACUUM ANALYZE;"

# Reindex
psql -U ems_user -d ems_supply_tracker -c "REINDEX DATABASE ems_supply_tracker;"
```

## Support

For issues and support:
- GitHub Issues: <repository-url>/issues
- Documentation: See README.md
- Email: support@ems-tracker.com
