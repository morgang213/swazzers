# API Documentation - EMS Supply Tracker

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication

All endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Response Format
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@demoems.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "agencyId": 1
  }
}
```

---

## Authentication Endpoints

### POST /auth/login
Login to the system.

**Request:**
```json
{
  "email": "admin@demoems.com",
  "password": "Password123!"
}
```

**Response:** 200 OK
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

### POST /auth/logout
Logout and invalidate refresh token.

**Request:**
```json
{
  "refreshToken": "..."
}
```

**Response:** 200 OK
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/refresh
Get a new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "..."
}
```

**Response:** 200 OK
```json
{
  "accessToken": "..."
}
```

### POST /auth/forgot-password
Request password reset.

**Request:**
```json
{
  "email": "admin@demoems.com"
}
```

**Response:** 200 OK
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

### POST /auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "reset-token-here",
  "password": "NewPassword123!"
}
```

**Response:** 200 OK
```json
{
  "message": "Password reset successful"
}
```

---

## User Endpoints

### GET /users
List all users (Admin only).

**Response:** 200 OK
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@demoems.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin",
      "phone": "555-0101",
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /users/me
Get current user profile.

**Response:** 200 OK
```json
{
  "user": {
    "id": 1,
    "email": "admin@demoems.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "phone": "555-0101",
    "active": true,
    "agency_id": 1
  }
}
```

### PUT /users/me
Update current user profile.

**Request:**
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "phone": "555-9999"
}
```

**Response:** 200 OK
```json
{
  "user": { ... }
}
```

### POST /users
Create new user (Admin only).

**Request:**
```json
{
  "email": "newuser@demoems.com",
  "password": "Password123!",
  "first_name": "New",
  "last_name": "User",
  "role": "medic",
  "phone": "555-0104"
}
```

**Response:** 201 Created

---

## Supply Endpoints

### GET /supplies
List supplies with optional filters.

**Query Parameters:**
- `category` - Filter by category ID
- `search` - Search by name, SKU, or manufacturer
- `active` - Filter by active status (true/false/all)

**Response:** 200 OK
```json
{
  "supplies": [
    {
      "id": 1,
      "name": "Epinephrine 1:1000 1mg/mL",
      "sku": "EPI-1000",
      "manufacturer": "Hospira",
      "category_name": "Medications",
      "unit_cost": "15.50",
      "default_par_level": 10,
      "tracks_expiration": true,
      "active": true
    }
  ]
}
```

### GET /supplies/:id
Get supply details.

**Response:** 200 OK
```json
{
  "supply": { ... }
}
```

### POST /supplies
Create new supply (Supervisor+).

**Request:**
```json
{
  "category_id": 1,
  "name": "New Supply",
  "sku": "NEW-001",
  "manufacturer": "Manufacturer",
  "unit_cost": 10.00,
  "default_par_level": 5,
  "tracks_expiration": true
}
```

**Response:** 201 Created

### PUT /supplies/:id
Update supply (Supervisor+).

**Request:**
```json
{
  "unit_cost": 12.00,
  "default_par_level": 8
}
```

**Response:** 200 OK

### DELETE /supplies/:id
Deactivate supply (Supervisor+).

**Response:** 200 OK

### GET /supplies/categories
List all supply categories.

**Response:** 200 OK
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Medications",
      "description": "Pharmaceuticals and drugs",
      "active": true
    }
  ]
}
```

---

## Inventory Endpoints

### GET /inventory/all
Get inventory summary across all locations.

**Response:** 200 OK
```json
{
  "inventory": [
    {
      "supply_id": 1,
      "supply_name": "Epinephrine",
      "sku": "EPI-1000",
      "category_name": "Medications",
      "total_quantity": 45,
      "total_par_level": 40
    }
  ]
}
```

### GET /inventory/units/:unitId
Get inventory for specific unit.

**Response:** 200 OK
```json
{
  "unit": {
    "id": 1,
    "name": "Medic 1",
    "type": "als"
  },
  "inventory": [
    {
      "id": 1,
      "supply_id": 1,
      "supply_name": "Epinephrine",
      "quantity": 8,
      "par_level": 10,
      "expiration_date": "2025-06-30",
      "inventory_status": "below_par",
      "expiration_status": "ok"
    }
  ]
}
```

### GET /inventory/stations/:stationId
Get inventory for specific station.

**Response:** Similar to unit inventory

### POST /inventory/usage
Record supply usage.

**Request:**
```json
{
  "location_type": "unit",
  "location_id": 1,
  "incident_number": "2024-001",
  "usage_type": "patient_care",
  "notes": "Cardiac arrest",
  "items": [
    {
      "supply_id": 1,
      "quantity": 2
    },
    {
      "supply_id": 5,
      "quantity": 1
    }
  ]
}
```

**Response:** 200 OK
```json
{
  "message": "Usage recorded successfully"
}
```

### POST /inventory/adjust
Adjust inventory quantity (Supervisor+).

**Request:**
```json
{
  "supply_id": 1,
  "location_type": "unit",
  "location_id": 1,
  "quantity": 10,
  "notes": "Physical count adjustment"
}
```

**Response:** 200 OK

### GET /inventory/expiring
Get expiring items.

**Query Parameters:**
- `days` - Number of days to look ahead (default: 90)

**Response:** 200 OK
```json
{
  "expiring": [
    {
      "supply_id": 1,
      "supply_name": "Epinephrine",
      "quantity": 8,
      "expiration_date": "2024-03-15",
      "expiration_status": "critical",
      "days_until_expiration": 25
    }
  ]
}
```

### GET /inventory/below-par
Get items below par level.

**Response:** 200 OK
```json
{
  "belowPar": [
    {
      "supply_id": 1,
      "supply_name": "Epinephrine",
      "quantity": 5,
      "par_level": 10,
      "inventory_status": "below_par",
      "deficit": 5
    }
  ]
}
```

---

## Order Endpoints

### GET /orders
List orders (Supervisor+).

**Query Parameters:**
- `status` - Filter by status

**Response:** 200 OK
```json
{
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-2024-00001",
      "status": "draft",
      "vendor": "Medical Supplies Inc",
      "total_cost": "450.00",
      "created_by_first_name": "Admin",
      "created_by_last_name": "User",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /orders/:id
Get order details with items.

**Response:** 200 OK
```json
{
  "order": {
    "id": 1,
    "order_number": "ORD-2024-00001",
    "status": "draft",
    "vendor": "Medical Supplies Inc",
    "total_cost": "450.00",
    "items": [
      {
        "id": 1,
        "supply_id": 1,
        "supply_name": "Epinephrine",
        "quantity_ordered": 20,
        "quantity_received": 0,
        "unit_cost": "15.50",
        "total_cost": "310.00"
      }
    ]
  }
}
```

### POST /orders
Create new order (Supervisor+).

**Request:**
```json
{
  "vendor": "Medical Supplies Inc",
  "notes": "Quarterly restock",
  "items": [
    {
      "supply_id": 1,
      "quantity_ordered": 20,
      "unit_cost": 15.50
    }
  ]
}
```

**Response:** 201 Created

### POST /orders/:id/submit
Submit order for approval.

**Response:** 200 OK

### POST /orders/:id/approve
Approve order (Admin only).

**Response:** 200 OK

### POST /orders/:id/receive
Receive order items.

**Request:**
```json
{
  "location_type": "station",
  "location_id": 1,
  "items": [
    {
      "order_item_id": 1,
      "quantity_received": 20
    }
  ]
}
```

**Response:** 200 OK

### GET /orders/reorder-list
Generate reorder suggestions.

**Response:** 200 OK
```json
{
  "items": [
    {
      "supply_id": 1,
      "supply_name": "Epinephrine",
      "total_needed": 15,
      "estimated_cost": "232.50"
    }
  ],
  "total_estimated_cost": 450.00
}
```

---

## Alert Endpoints

### GET /alerts
List alerts.

**Query Parameters:**
- `is_read` - Filter by read status (true/false)
- `severity` - Filter by severity (info/warning/critical)
- `type` - Filter by type (expiring/expired/below_par/out_of_stock)

**Response:** 200 OK
```json
{
  "alerts": [
    {
      "id": 1,
      "type": "expiring",
      "severity": "warning",
      "title": "Expiring: Epinephrine",
      "message": "Epinephrine expires in 25 days",
      "supply_id": 1,
      "supply_name": "Epinephrine",
      "is_read": false,
      "is_dismissed": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /alerts/:id/read
Mark alert as read.

**Response:** 200 OK

### PUT /alerts/:id/dismiss
Dismiss alert.

**Response:** 200 OK

### PUT /alerts/read-all
Mark all alerts as read.

**Response:** 200 OK

---

## Admin Endpoints

All admin endpoints require admin role.

### GET /admin/agency
Get agency details.

**Response:** 200 OK
```json
{
  "agency": {
    "id": 1,
    "name": "Demo EMS Agency",
    "address": "123 Main Street",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "phone": "555-0100",
    "email": "admin@demoems.com",
    "settings": {},
    "active": true
  }
}
```

### PUT /admin/agency
Update agency details.

### GET /admin/stations
List all stations.

**Response:** 200 OK
```json
{
  "stations": [
    {
      "id": 1,
      "name": "Station 1 - Main",
      "address": "100 First Street",
      "city": "Springfield",
      "state": "IL",
      "unit_count": 2
    }
  ]
}
```

### POST /admin/stations
Create new station.

### PUT /admin/stations/:id
Update station.

### GET /admin/units
List all units.

**Response:** 200 OK
```json
{
  "units": [
    {
      "id": 1,
      "name": "Medic 1",
      "type": "als",
      "station_id": 1,
      "station_name": "Station 1 - Main",
      "vehicle_id": "M1-2023",
      "active": true
    }
  ]
}
```

### POST /admin/units
Create new unit.

### PUT /admin/units/:id
Update unit.

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address.

**Rate Limit Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

**Response when rate limited (429):**
```json
{
  "error": "Too many requests, please try again later"
}
```
