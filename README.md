# EMS Supply Tracker

A complete cloud-based medical supply inventory management system for Emergency Medical Services (EMS) agencies. This SaaS product helps EMS organizations track medical supplies across their fleet of ambulances and stations.

## Features

### Core Functionality
- ✅ Track medical supply inventory across ambulances (units) and stations
- ✅ Monitor expiration dates with advance warnings (30/60/90 days)
- ✅ Maintain par levels and alerts when supplies are low
- ✅ Record supply usage linked to incidents/calls
- ✅ Generate reorder lists and track orders
- ✅ Reports and analytics on inventory, costs, and usage

### User Roles
- **Medics/EMTs**: Record supply usage after calls, view unit inventory
- **Supervisors**: Manage inventory, review reports, handle orders
- **Admins**: Configure system, manage users, agency settings

### Design Philosophy
- **"Boomer-proof" interface**: Large buttons (min 44px touch targets), clear labels, obvious actions
- **Mobile-first**: Primary use is on tablets/phones in ambulances
- **Speed**: Common tasks (record usage) in under 15 seconds
- **Simplicity**: No training manual needed, intuitive workflows

## Technology Stack

### Backend
- Node.js 20.x
- Express.js 4.x
- PostgreSQL 15+ with Knex.js 3.x
- JWT Authentication (jsonwebtoken + bcryptjs)
- Winston logging

### Frontend
- Next.js 14.x (App Router)
- React 18
- Tailwind CSS 3.x
- Zustand (state management)
- API client with fetch

### Infrastructure
- Docker + Docker Compose
- PostgreSQL 15

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20.x (for local development)

### Running with Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd swazzers
```

2. Start all services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend application on port 3000

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Demo Login Credentials

```
Admin:      admin@demoems.com / Password123!
Supervisor: supervisor@demoems.com / Password123!
Medic:      medic@demoems.com / Password123!
```

### Local Development

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate:latest
npm run seed:run
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
swazzers/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, JWT configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Data access layer
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── jobs/            # Scheduled jobs
│   │   └── utils/           # Helpers, logger, errors
│   ├── migrations/          # Knex migrations
│   ├── seeds/               # Seed data
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Base components
│   │   │   ├── layout/      # Layout components
│   │   │   └── features/    # Feature components
│   │   ├── lib/             # API client, utilities
│   │   ├── hooks/           # Custom React hooks
│   │   └── store/           # Zustand stores
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login, returns JWT tokens
- `POST /api/v1/auth/logout` - Invalidate refresh token
- `POST /api/v1/auth/refresh` - Get new access token
- `POST /api/v1/auth/forgot-password` - Send reset email
- `POST /api/v1/auth/reset-password` - Reset with token

### Supplies (Catalog)
- `GET /api/v1/supplies` - List supplies (with filters)
- `GET /api/v1/supplies/:id` - Get supply details
- `POST /api/v1/supplies` - Create supply (supervisor+)
- `PUT /api/v1/supplies/:id` - Update supply (supervisor+)
- `DELETE /api/v1/supplies/:id` - Deactivate supply (supervisor+)
- `GET /api/v1/supplies/categories` - List categories
- `POST /api/v1/supplies/categories` - Create category

### Inventory
- `GET /api/v1/inventory/units/:unitId` - Get unit inventory
- `GET /api/v1/inventory/stations/:stationId` - Get station inventory
- `GET /api/v1/inventory/all` - Get all inventory (summary)
- `POST /api/v1/inventory/usage` - Record usage (multiple items)
- `POST /api/v1/inventory/adjust` - Adjust quantity
- `GET /api/v1/inventory/expiring` - Get expiring items
- `GET /api/v1/inventory/below-par` - Get items below par

## Database Schema

The application uses a multi-tenant PostgreSQL database with the following core tables:

- **agencies** - Organization data
- **users** - User accounts with roles
- **stations** - Physical station locations
- **units** - Ambulances/vehicles
- **supply_categories** - Categories for organizing supplies
- **supplies** - Master supply catalog
- **inventory_records** - Current inventory at each location
- **transactions** - Audit log of all inventory changes
- **orders** - Supply orders with status tracking
- **order_items** - Line items for orders
- **alerts** - System alerts for expiring/low stock items
- **refresh_tokens** - JWT refresh token storage

## Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-tenant data isolation (all queries filtered by agency_id)
- Password hashing with bcrypt (12 rounds)
- Security headers with Helmet
- Rate limiting
- Parameterized queries (SQL injection prevention)

## Development

### Database Migrations

```bash
cd backend
npm run migrate:latest    # Run migrations
npm run migrate:rollback  # Rollback migrations
npm run seed:run          # Seed demo data
```

### Environment Variables

Backend (.env):
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=ems_user
DB_PASSWORD=ems_password
DB_NAME=ems_supply_tracker
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

Frontend:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Production Build

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@ems-tracker.com or open an issue on GitHub.