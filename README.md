# DataMind AI — Business Intelligence Platform (Go-styled README)

A comprehensive AI-powered business intelligence platform that transforms raw data into actionable insights through interactive dashboards, natural language queries, and automated analytics.

This README is styled for Go projects while preserving the full original content below.

## Table of Contents

- Overview
- Go Backend (recommended)
- Legacy Backend (Flask)
- Frontend
- Environment variables
- Database migrations
- Background worker
- Testing & Troubleshooting
- Project Structure
- Authentication
- Migration plan
- Features
- Tech Stack
- Contributing
- License
- Support
- Original README (verbatim)

---

## Overview

DataMind AI is an AI-powered BI platform with natural language queries, interactive dashboards, multi-source ingestion, scheduled reports, and LLM integration. This repository supports a frontend and backend plus background workers. This README contains Go-centric setup notes and preserves the full original documentation below.

---

## Go Backend (recommended)

Note: The project currently includes a Flask backend. For Go adoption, consider implementing an idiomatic Go backend (net/http, chi/gorilla mux, GORM/pgx for DB, go-redis, Celery alternatives like asynq or go-workers, and OpenAI integration via official client). Example quick-start steps for a Go backend:

1. Initialize module

```bash
go mod init github.com/yourorg/datamind-ai
```

2. Create main module and subpackages:

- cmd/server/main.go
- internal/app/ (handlers, services, models, migrations)
- internal/worker/ (background jobs)
- pkg/api/ (clients for OpenAI, S3, email)

3. Common dev commands

```bash
# build
go build ./cmd/server

# run
go run ./cmd/server

# tests
go test ./...

# lint (if using golangci-lint)
golangci-lint run
```

4. Database and migrations (example using golang-migrate)

```bash
migrate -path db/migrations -database "${DATABASE_URL}" up
```

5. Background worker: use asynq or a similar library for Redis-backed tasks.

6. Environment variables: use a .env during development and a configuration loader (envconfig, viper).

7. OpenAI: use official or community Go client and rate-limit/stream responses as needed.

8. S3/file-storage: use the AWS SDK for Go (v2).

This README preserves the detailed Flask instructions and the complete original content below for reference and migration tasks.

---

## Legacy Backend (Flask)

The original project contains a Flask backend and detailed setup; keep it for reference or run it as-is. See "Original README (verbatim)" below for every instruction and file listed.

---

## Frontend

The frontend is a React + Vite app. Typical Go deployments serve the built frontend from a static server or use a separate host (Vercel/Netlify).

Build and run frontend:

```bash
cd frontend
npm install
npm run dev
# build
npm run build
```

Set VITE_API_URL in frontend .env to the API base URL:

```
VITE_API_URL=http://localhost:5000/api
```

---

## Background worker (Redis-based)

For Flask this uses Celery + Redis. For Go, implement a Redis-backed worker (asynq, go-workers) with similar task handlers.

---

## Environment variables

Keep secrets out of source control. Example variables (as used in original content):

```
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URI=postgresql://user:pass@localhost:5432/datamind_ai
OPENAI_KEY=sk-...
S3_BUCKET_NAME=your-bucket
REDIS_URI=redis://localhost:6379/0
```

And for production:

```
DATABASE_URL=postgresql://username:password@localhost:5432/datamind_ai
OPENAI_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...
REDIS_URL=redis://localhost:6379/0
```

---

## Database migrations

For Flask the project uses Flask-Migrate. For Go, consider golang-migrate or goose. Example commands in original:

```bash
flask db init
flask db migrate -m "initial"
flask db upgrade
```

Or for recreation:

```bash
flask db stamp head
flask db migrate -m "recreate"
flask db upgrade
```

---

## Testing & Troubleshooting

- Test auth and protected routes with curl or Postman.
- Example curl login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"yourpassword"}'
```

- Check logs:

```bash
tail -f backend/logs/app.log
```

- Run unit tests:

```bash
pytest
# or for Go backend:
go test ./...
```

- Inspect Celery/worker, Redis, and Flask/Go server logs for background job issues.

---

## Contributing

- Create issues for bugs and feature requests.
- Follow coding standards and add tests for new features.
- Open pull requests against the main branch; include migration notes and environment changes.

---

## License

This project is proprietary software developed by DSAH. Consult the project owner for license and distribution terms.

---

## Support

Developer: Mohammed Bahageel — m.bahageel88@gmail.com
Organization: DSAH

(For production deployments, rotate keys, remove hardcoded credentials, and secure all secrets.)

---

## Original README (verbatim)

Below is the entire original content preserved exactly as provided.

**Developer:** Mohammed Bahageel, AI Developer at DSAH

A comprehensive AI-powered business intelligence platform that transforms raw data into actionable insights through interactive dashboards, natural language queries, and automated analytics.
Developer: Mohammed Bahageel, AI Developer at DSAH

A comprehensive AI-powered business intelligence platform that transforms raw data into actionable insights through interactive dashboards, natural language queries, and automated analytics.

📋 Table of Contents

Features

Tech Stack

Getting Started

### Getting Started

#### Quick Setup

1. Clone the repository and switch to the project root.
2. Prepare separate environments for backend and frontend.

#### Backend (Flask)

- Create and activate a virtual environment:

```bash
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

- Install dependencies:

```bash
pip install -r backend/requirements.txt
```

- Create an environment file (backend/.env) with keys similar to:

```
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URI=postgresql://user:pass@localhost:5432/datamind_ai
OPENAI_KEY=sk-...
S3_BUCKET_NAME=your-bucket
REDIS_URI=redis://localhost:6379/0
```

- Initialize and migrate the database:

```bash
cd backend
flask db init
flask db migrate -m "initial"
flask db upgrade
```

- Create an admin user (one-time):

```bash
python create_admin.py
```

- Start the backend server:

```bash
python run.py
```

#### Background worker (Celery)

- Launch the worker connected to the Redis broker:

```bash
celery -A app.celery_app worker --loglevel=info
```

#### Frontend

- Install and start the client (from the frontend root):

```bash
npm install
npm run dev
```

- To build for production:

```bash
npm run build
```

#### API Client & Env

- Point the frontend at your API by setting a variable in the frontend env file (e.g., VITE_API_URL) to the backend API base URL (http://localhost:5000/api).

#### Testing & Troubleshooting

- Verify auth and protected routes by logging in and exercising endpoints with a tool like curl or Postman.
- If migrations fail, inspect DATABASE_URI and recreate the migration folder after backing up data.
- Check logs for Celery, Flask, and Redis for background job issues.

#### Useful Commands

```bash
# check backend logs
tail -f backend/logs/app.log

# run unit tests (if present)
pytest
```

Project Structure

Authentication

Migration to Flask Backend

API Documentation

Contributing

✨ Features
Core Functionality

AI-Powered Data Analysis: Natural language queries to extract insights from your data

Interactive Dashboards: Create custom visualizations with drag-and-drop interface

Multiple Data Sources: CSV, Excel, Google Sheets

Chat Interface: Conversational AI assistant for data exploration

Real-time Insights: Automated anomaly detection and trend analysis

Report Generation: Create and schedule automated reports

Template Library: Save and share dashboard configurations

Dark/Light Mode: Customizable themes

Advanced Features

Cross-chart Filtering

Drill-down Analysis

Custom Metrics (KPIs)

Data Validation & Quality Checks

Export Dashboards & Reports

Voice Input for Hands-free Queries

🛠 Tech Stack
Frontend

React 18

React Router

TanStack Query

Tailwind CSS

shadcn/ui

Framer Motion

ECharts

Lucide React

React Quill

date-fns

Backend (Current – Base44)

Entity management

LLM integration

Built-in auth

File storage

Email service

Backend (Target – Flask)

Flask

SQLAlchemy

PostgreSQL / MongoDB

JWT

# DataMind AI — Business Intelligence Platform

A comprehensive AI-powered business intelligence platform that transforms raw data into actionable insights through interactive dashboards, natural language queries, and automated analytics.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend (Flask)](#backend-flask)
  - [Background worker (Celery)](#background-worker-celery)
  - [Frontend](#frontend)
  - [Environment variables](#environment-variables)
  - [Database migrations](#database-migrations)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Migration to Flask Backend](#migration-to-flask-backend)
- [Testing & Troubleshooting](#testing--troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Features

Core:

- AI-powered data analysis (natural language queries)
- Interactive dashboards with drag-and-drop
- Multi-source ingestion (CSV, Excel, Google Sheets)
- Conversational chat interface for exploration
- Real-time anomaly detection and trend analysis
- Scheduled report generation and exports
- Template library and theme (dark/light) support

Advanced:

- Cross-chart filtering and drill-down analysis
- Custom KPIs and data validation
- Exportable dashboards and reports
- Optional voice input for queries

## Tech Stack

Frontend:

- React 18, React Router, TanStack Query
- Tailwind CSS, shadcn/ui, Framer Motion
- ECharts, Lucide React, React Quill, date-fns

Backend (target):

- Flask, Flask-SQLAlchemy, Flask-Migrate
- PostgreSQL / MongoDB
- Flask-JWT-Extended (JWT auth)
- OpenAI API integration
- Celery + Redis for background jobs
- AWS S3 (boto3) for file storage
- Email service, Pandas, Pillow, openpyxl

## Getting Started

### Prerequisites

- Node.js >= 18, npm >= 9
- Python 3.10+
- PostgreSQL (or MongoDB if configured)
- Redis (for Celery)

### Backend (Flask)

1. Clone and enter project:

   ```bash
   git clone <repository-url>
   cd datamind-ai
   ```

2. Create Python venv and install:

   ```bash
   python -m venv .venv
   # macOS / Linux
   source .venv/bin/activate
   # Windows (PowerShell)
   .venv\Scripts\Activate.ps1

   pip install -r backend/requirements.txt
   ```

3. Create backend/.env (development only — never commit secrets):

   ```
   FLASK_APP=run.py
   FLASK_ENV=development
   DATABASE_URI=postgresql://user:pass@localhost:5432/datamind_ai
   OPENAI_KEY=your-openai-key
   S3_BUCKET_NAME=your-bucket
   REDIS_URI=redis://localhost:6379/0
   ```

4. Initialize and migrate DB:

   ```bash
   cd backend
   flask db init
   flask db migrate -m "initial"
   flask db upgrade
   ```

5. Create an admin user (one-time):

   ```bash
   python create_admin.py
   ```

6. Start the backend:
   ```bash
   python run.py
   ```

### Background worker (Celery)

Start Celery connected to Redis:

```bash
celery -A app.celery_app worker --loglevel=info
```

### Frontend

From project root, open frontend folder and run:

```bash
cd frontend
npm install
npm run dev
# build for production
npm run build
```

Open the app in browser (default Vite):
http://localhost:5173

### Environment variables (frontend)

Create frontend .env with:

```
VITE_API_URL=http://localhost:5000/api
```

### Database migrations

If migrations fail, verify DATABASE_URI and, after backup, recreate migration folder:

```bash
flask db stamp head
flask db migrate -m "recreate"
flask db upgrade
```

## Project Structure (high level)

datamind-ai/

- backend/
  - app/
    - **init**.py
    - config.py
    - models/
    - routes/
    - services/
    - utils/
  - migrations/
  - run.py
- frontend/
  - src/
    - pages/
      - Home.js, Auth.js, Dashboard.js, AIChat.js, DataSources.js, Reports.js, Schedules.js, Settings.js
    - components/
      - charts/, chat/, dashboard/, data/, navigation/, ui/
    - api/
      - apiClient.js
  - globals.css
- create_admin.py
- README.md

Entities:

- DataSource, ChatHistory, Analysis, Report, Schedule, CustomInsight

## Authentication

- Development: localStorage-based auth (replace before production).
- Production: Flask JWT-based endpoints:
  - POST /api/auth/login
  - POST /api/auth/register
  - GET /api/auth/me

Protected routes validate the JWT token.

Default development credentials should be set up via create_admin.py. Do not hardcode credentials in production.

## Migration to Flask Backend (summary)

Phases:

1. Backend setup: project layout, dependencies, models, authentication, CRUD routes, LLM wrapper, file & email services.
2. Frontend migration: create API client (src/api/apiClient.js), replace Base44 integrations with Flask endpoints (auth, data sources, LLM/chat, reports).
3. Environment setup: standardize .env for backend and frontend.
4. Database migration: use Flask-Migrate commands.
5. Testing & deployment: run unit/integration tests, deploy backend (Heroku/EC2/DigitalOcean) and frontend (Vercel/Netlify/S3 + CloudFront).

## Testing & Troubleshooting

- Test auth and protected routes with curl or Postman.
- Example curl login:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","password":"yourpassword"}'
  ```
- Check logs:
  ```bash
  tail -f backend/logs/app.log
  ```
- Run tests (if present):
  ```bash
  pytest
  ```
- Inspect Celery, Redis, and Flask logs for background job issues.

## Contributing

- Create issues for bugs and feature requests.
- Follow coding standards and add tests for new features.
- Open pull requests against the main branch; include migration notes and environment changes.

## License

This project is proprietary software developed by DSAH. Consult the project owner for license and distribution terms.

## Support

Developer: Mohammed Bahageel — m.bahageel88@gmail.com
Organization: DSAH

(For production deployments, rotate keys, remove hardcoded credentials, and secure all secrets.)

Celery

Redis

🚀 Getting Started
Prerequisites

Node.js ≥ 18

npm ≥ 9

Installation
git clone <repository-url>
cd datamind-ai
npm install
npm run dev

Open in browser:
http://localhost:5173

Default Login Credentials
Email: m.bahageel88@gmail.com
Password: Bahageel88#

📁 Project Structure

datamind-ai

├── pages/
│ ├── Home.js
│ ├── Auth.js
│ ├── Dashboard.js
│ ├── AIChat.js
│ ├── DataSources.js
│ ├── Reports.js
│ ├── Schedules.js
│ └── Settings.js
│
├── components/
│ ├── charts/
│ │ ├── EChartsWrapper.js
│ │ ├── InteractiveChart.js
│ │ ├── ChartGenerator.js
│ │ └── ChartBrushManager.js
│ ├── chat/
│ │ ├── ChatInputWidget.js
│ │ └── ChatHistoryPanel.js
│ ├── dashboard/
│ │ ├── KPICard.js
│ │ ├── DraggableGrid.js
│ │ ├── SaveTemplateDialog.js
│ │ └── TemplateLibrary.js
│ ├── data/
│ │ ├── DataValidation.js
│ │ └── DataSourceSuggestions.js
│ ├── navigation/
│ │ ├── AppNav.js
│ │ └── ThemeToggle.js
│ └── ui/
│
├── entities/
│ ├── DataSource.json
│ ├── ChatHistory.json
│ ├── Analysis.json
│ ├── Report.json
│ ├── Schedule.json
│ └── CustomInsight.json
│
├── Layout.js
├── globals.css
└── utils.js

🔐 Authentication

The current setup uses localStorage-based authentication with hardcoded credentials (development only).

Authentication Flow

User lands on /

Clicks Get Started → navigates to /auth

User logs in

JWT token is stored in localStorage

Protected routes validate authentication status before rendering

Key Files

pages/Auth.js

pages/Home.js

Layout.js

🔄 Migration to Flask Backend

This project is migrating away from Base44 to a full Flask backend, enabling full control, scalability, and enterprise-level integrations.

📝 Comprehensive Migration Plan
Phase 1 — Backend Setup
1.1 Folder Structure
backend/
├── app/
│ ├── **init**.py
│ ├── config.py
│ ├── models/
│ ├── routes/
│ ├── services/
│ └── utils/
├── migrations/
├── requirements.txt
├── .env
└── run.py

1.2 Dependencies (requirements.txt)
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-JWT-Extended==4.5.3
Flask-CORS==4.0.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
openai==1.3.0
celery==5.3.4
redis==5.0.1
boto3==1.29.0
Pillow==10.1.0
pandas==2.1.3
openpyxl==3.1.2

1.3 Database Models

User

DataSource

ChatHistory

Analysis

Report

Schedule

CustomInsight

(Full model implementation already provided in your specification.)

1.4 Flask App Configuration

SQLAlchemy ORM

JWT authentication

CORS configuration

Modular Blueprints

1.5 Authentication Routes

Endpoints:

POST /api/auth/login

POST /api/auth/register

GET /api/auth/me

1.6 Data Source Routes

CRUD operations:

GET /api/data-sources

POST /api/data-sources

PUT /api/data-sources/:id

DELETE /api/data-sources/:id

1.7 LLM Service

A wrapper around OpenAI Chat Completions API, enabling structured responses via JSON schema.

Phase 2 — Frontend Migration
2.1 Create API Client

Create src/api/apiClient.js, including:

Auth API

Data Sources API

Chat History API

Insights API

LLM invocation

File upload (multipart)

2.2 Update Auth Page

Replace Base44 calls with Flask JWT login.

2.3 Update Data Sources Page

Replace:

base44.entities.DataSource...

with:

dataSourcesAPI...

2.4 Update AIChat Page

Replace Base44 LLM calls → Flask LLM microservice.

2.5 Update Chat History Panel

All Base44 calls replaced with new API methods.

2.6 Update Dashboard

Implement Insights API for:

Listing insights

Creating custom metrics

Updating and deleting insights

Phase 3 — Environment Setup
Backend .env
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/datamind_ai

OPENAI_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...

REDIS_URL=redis://localhost:6379/0

Frontend .env
VITE_API_URL=http://localhost:5000/api

Phase 4 — Database Migration
Commands
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

Create Admin User
python create_admin.py

Phase 5 — Testing & Deployment
Start Backend
python run.py

Start Frontend
npm run dev

Test Authentication
curl -X POST http://localhost:5000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"m.bahageel88@gmail.com","password":"Bahageel88#"}'

📄 Complete File Change Summary
Backend — New Files

Flask application structure

All route modules

All model modules

LLM service

File upload service

Email service

.env, requirements.txt

Frontend — New Files

src/api/apiClient.js

Frontend — Modified Files

pages/Auth.js

pages/Home.js

pages/Dashboard.js

pages/DataSources.js

pages/AIChat.js

pages/Reports.js

pages/Schedules.js

pages/Settings.js

All CRUD components

Layout.js

Frontend — Removed Files

base44Client.js

🎯 Migration Checklist
Backend

✔ Flask project initialized
✔ Models created
✔ JWT authentication added
✔ CRUD routes created
✔ LLM integration implemented
✔ File upload service configured
✔ Email service implemented
✔ Admin user created

Frontend

✔ Base44 removed
✔ API client implemented
✔ All pages migrated to Flask API
✔ Error handling added

Testing

✔ Authentication flow
✔ CRUD operations
✔ Dashboard functioning
✔ Chat and LLM responses
✔ Token expiration handling

🚀 Production Deployment
Backend Deployment

Heroku

AWS EC2

DigitalOcean

Frontend Deployment

Vercel

Netlify

AWS S3 + CloudFront

📞 Support

Developer: Mohammed Bahageel

Organization: DSAH

Email: m.bahageel88@gmail.com

📜 License

This project is proprietary software developed by DSAH.

🙏 Acknowledgments

Built using cutting-edge AI and modern web technologies to transform business intelligence at scale.
