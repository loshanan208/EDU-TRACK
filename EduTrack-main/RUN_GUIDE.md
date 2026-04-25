# EDUTrack Run Guide

## 1) Backend setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Update `.env` values as needed, especially:
- `MONGO_URI`
- `JWT_SECRET`

## 2) Seed demo data

```bash
cd backend
npm run seed:reset
```

Demo credentials created:
- Admin: `admin@edutrack.edu` / `Admin@12345`
- Teacher: `alicia.parker@edutrack.edu` / `Teacher@123`
- Student: `emma.collins@edutrack.edu` / `Student@123`

## 3) Start backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5000`.

## 4) Frontend setup and run

```bash
cd frontend
npm install
```

Create frontend env file:

```bash
cp .env.example .env
```

Start frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 5) Quick API checks

Use [backend/api-requests.http](backend/api-requests.http) with the VS Code REST client extension, or use Postman/Insomnia with the same endpoints.
