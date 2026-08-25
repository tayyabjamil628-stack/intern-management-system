# Production Deployment Guide — Intern Management System (IMS)

## 1. Overview & Status

This document outlines the **production deployment architecture, configuration guidelines, and operational readiness procedures** for the Intern Management System (IMS).

> [!IMPORTANT]
> **Current Version Boundary & Security Notice**:
> This document describes **deployment-ready infrastructure preparation**.
> Version 1 of the IMS is an internal administrative management portal that currently operates **without backend authentication/JWT or role-based authorization middleware**. It should not be exposed to the public internet without an upstream authentication proxy (e.g. Cloudflare Access, AWS Cognito / ALB Auth, VPN, or reverse-proxy authentication) or until application-level authentication is implemented.

---

## 2. Conceptual Production Deployment Topology

```
                                USER BROWSER
                                     │
                             HTTPS Request (443)
                                     ▼
                            PRODUCTION REVERSE PROXY
                         (Nginx / Cloudflare / ALB / CDN)
                                     │
                   ┌─────────────────┴─────────────────┐
                   │                                   │
              Static Assets                        API Traffic
           (Frontend SPA Bundle)                   (/api/v1/*)
                   │                                   │
                   ▼                                   ▼
          STATIC ASSET HOSTING                  APPLICATION CONTAINER
         (Nginx / S3 / Cloud Storage)          (FastAPI + Uvicorn ASGI)
                                                   Port 8000
                                                       │
                                               SQLAlchemy Engine
                                                       │
                                                       ▼
                                              DATABASE INSTANCE
                                                  (MySQL 8+)
                                              Port 3306 (Private VPC)
```

---

## 3. Frontend Build & Static Hosting

The React frontend compiles into optimized, standalone static assets (HTML, JavaScript, CSS).

### 3.1 Production Build
Execute the production build from the frontend directory:
```bash
cd C:\Projects\IMS\frontend
npm install
npm run build
```

* **Output Directory**: `frontend/dist/`
* **Static Assets**: Contains `index.html`, minified JavaScript chunks, and compiled CSS.
* **Hosting**: Can be served by Nginx, Caddy, AWS S3 + CloudFront, GCP Cloud Storage + Cloud CDN, or Azure Blob Storage.

### 3.2 Production API Configuration (`VITE_API_BASE_URL`)
The frontend communicates with the backend via the `VITE_API_BASE_URL` environment variable.
In production, this must point to the public HTTPS domain of the FastAPI backend:

```env
# frontend/.env (Production build)
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

> [!CAUTION]
> Never use `http://localhost:8000` or `http://127.0.0.1:8000` in production builds.

---

## 4. Backend Production Configuration & Startup

The FastAPI backend runs as an ASGI application via Uvicorn.

### 4.1 Production Startup Command
```bash
cd C:\Projects\IMS\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4.2 Health Check & Probes
* **Endpoint**: `GET /api/v1/health`
* **Expected Response**: `{"status": "ok"}`
* **HTTP Status**: `200 OK`
* **Usage**: Configure this endpoint for Load Balancer health checks, Kubernetes liveness/readiness probes, or container healthchecks.

---

## 5. Production Database Setup (MySQL 8+)

### 5.1 Database Instance Requirements
* **Engine**: MySQL 8.0+
* **Character Set**: `utf8mb4`
* **Collation**: `utf8mb4_unicode_ci`
* **Network Isolation**: The MySQL database should reside on a private subnet/VPC accessible only by the backend application container.

### 5.2 Least-Privilege Database User
Never run the production application using the MySQL `root` account. Create a dedicated application user:
```sql
CREATE DATABASE IF NOT EXISTS intern_management_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'ims_app_user'@'%' IDENTIFIED BY 'StrongRandomPasswordHere';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON intern_management_system.* TO 'ims_app_user'@'%';
FLUSH PRIVILEGES;
```

### 5.3 Database Migrations (Alembic)
Apply all version-controlled migrations up to the current head before routing production traffic:
```bash
cd C:\Projects\IMS\backend
python -m alembic upgrade head
```

* **Current Migration Head**: `d4f3a8b7c5e4` (`create_attendance_table`)
* **Verify Current Version**: `python -m alembic current`

---

## 6. Production Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `production` | Environment mode |
| `DEBUG` | `false` | Disables verbose debug logging & detailed traceback disclosures |
| `API_PREFIX` | `/api/v1` | URL routing prefix for all REST endpoints |
| `ALLOWED_ORIGINS` | `https://app.yourdomain.com` | Comma-separated list of approved frontend HTTPS origins |
| `DATABASE_URL` | `mysql+pymysql://ims_app_user:PASSWORD@db-host:3306/intern_management_system` | Production database connection string |

### CORS Security Rules
* **Explicit Origins**: Only explicitly list the approved HTTPS frontend domains in `ALLOWED_ORIGINS`.
* **No Wildcards**: Never use `ALLOWED_ORIGINS=*` when credentials or cookies are involved.
* **Localhost Restrictions**: Remove `localhost` and `127.0.0.1` origins in production environments.

---

## 7. Secrets & Credential Management

* **No Plain-Text Credentials in Git**: `.env` files are strictly excluded via `.gitignore`.
* **URL Encoding**: If database passwords contain special characters (`@`, `#`, `:`, `/`, `?`, `%`), ensure they are URL-encoded in `DATABASE_URL` (e.g. `@` $\rightarrow$ `%40`).
* **Cloud Secret Managers**: In enterprise production, inject environment variables at runtime via AWS Secrets Manager, GCP Secret Manager, Vault, or Kubernetes Secrets.

---

## 8. Docker Readiness

The backend includes a production-ready `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Building and Running the Docker Container
```bash
# Build the backend container image
docker build -t ims-backend:1.0.0 ./backend

# Run the backend container
docker run -d \
  --name ims-backend \
  -p 8000:8000 \
  -e APP_ENV=production \
  -e DEBUG=false \
  -e ALLOWED_ORIGINS="https://app.yourdomain.com" \
  -e DATABASE_URL="mysql+pymysql://ims_app_user:PASSWORD@host.docker.internal:3306/intern_management_system" \
  ims-backend:1.0.0
```

---

## 9. Logging & Error Handling in Production

* **Application Logs**: FastAPI logs standard operational events (startup, routing, shutdown) to standard output (`stdout`/`stderr`).
* **Traceback Protection**: When `DEBUG=false`, internal server errors return generic, sanitized `500 Internal Server Error` responses to clients, preventing stack trace or SQL query disclosure.
* **Client Sanitization**: The frontend `apiClient.ts` captures network and HTTP errors, presenting clean user notifications.

---

## 10. Database Backup & Disaster Recovery

### 10.1 Automated Backups
Schedule daily logical backups using `mysqldump` or cloud-native automated snapshots:
```bash
mysqldump -u ims_app_user -p --single-transaction --quick --routines intern_management_system > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 10.2 Retention & Testing
* **Retention Policy**: Retain daily backups for 30 days, weekly backups for 90 days.
* **Restoration Testing**: Periodically restore database dumps to an isolated staging environment to verify data integrity.

### 10.3 Migration Rollback Considerations
If a newly deployed migration encounters issues:
```bash
# Downgrade by 1 revision
python -m alembic downgrade -1

# Downgrade to a specific revision
python -m alembic downgrade <revision_id>
```

---

## 11. Step-by-Step Production Deployment Checklist

Use this checklist during every production release:

- [ ] **1. Build Frontend**: Run `npm run build` inside `frontend/` and confirm `dist/` is generated with 0 errors.
- [ ] **2. Configure `VITE_API_BASE_URL`**: Ensure frontend build points to the production HTTPS API endpoint.
- [ ] **3. Configure Backend Environment**: Verify `backend/.env` has `APP_ENV=production` and `DEBUG=false`.
- [ ] **4. Configure Production CORS**: Set `ALLOWED_ORIGINS` to exact production frontend domain(s).
- [ ] **5. Provision MySQL Database**: Ensure MySQL 8+ is running with dedicated user credentials.
- [ ] **6. Run Alembic Migrations**: Execute `python -m alembic upgrade head` and verify head `d4f3a8b7c5e4`.
- [ ] **7. Start Backend Service**: Launch FastAPI ASGI server on host `0.0.0.0` port `8000`.
- [ ] **8. Verify Health Check**: Verify `GET /api/v1/health` returns `200 OK` with `{"status": "ok"}`.
- [ ] **9. Verify End-to-End Connectivity**: Test basic CRUD operation (e.g. load departments list) from the frontend.
- [ ] **10. Verify Frontend UI**: Inspect browser console for zero unexpected exceptions or 404 assets.
- [ ] **11. Verify Application Logs**: Confirm standard stdout logging is active without syntax or DB connection warnings.
- [ ] **12. Confirm Backup Schedule**: Verify automated MySQL snapshot/dump procedures are active.
