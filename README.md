# EduExam - Backend

Backend for the EduExam application (exam management with MCQ).

## Requirements

- Node.js 22
- Docker + Docker Compose

## Setup

1. Install dependencies

```
npm install
```

2. Copy the env file and adjust if needed

```
cp .env.example .env
```

3. Start the database

```
docker compose up -d
```

The database schema is created automatically on first start (see db/init.sql).

4. Start the server

```
npm run dev
```

The API runs on http://localhost:3000/api

## Test accounts

Admin:
- email: admin@example.com
- password: admin1234

Student:
- password: password
## Project structure

```
src/
  config/       database connection
  models/       TypeScript interfaces
  repositories/ raw SQL queries
  services/     business logic and rules
  controllers/  request handlers
  routes/       route definitions
  security/     auth, JWT, error handling
```

## API specification

See openapi.yml for the full API contract.
