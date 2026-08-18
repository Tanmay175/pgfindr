# PGFindrrr

A full-stack PG (Paying Guest) accommodation discovery and booking platform.

Rebuilt from the ground up as a MERN application: React + Vite + Tailwind on the frontend, Node/Express + MongoDB on the backend, with two user roles — **Student** and **PG Owner**.

## Structure

```
client/   React + Vite + Tailwind frontend
server/   Express + MongoDB REST API
```

## Getting started

### Server

```bash
cd server
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

The client dev server proxies `/api` requests to `http://localhost:5000`.

## Status

This is being built out in phases. Current progress:

- [x] Phase 1 — Project scaffold (client + server structure)
- [x] Phase 2 — Authentication (JWT, roles, register/login/logout/me)
- [x] Phase 3 — PG listing model + owner management
- [x] Phase 4 — Student search & filters
- [x] Phase 5 — Availability & booking system
- [x] Phase 6 — Owner booking management
- [x] Phase 7 — Favorites, reviews & ratings
- [x] Phase 8 — Dashboards, notifications, UI polish
- [x] Phase 9 — Security hardening, validation, testing

## Security notes

- Passwords hashed with bcrypt, never stored or returned in plain text
- JWT auth via HTTP-only cookies (not accessible to client-side JS)
- Role-based middleware (`requireStudent` / `requireOwner`) plus explicit ownership checks on every write endpoint
- Rate limiting: 20 req/15min on auth endpoints, 300 req/15min general API
- `express-mongo-sanitize` strips `$`/`.` keys from input to block NoSQL operator injection
- Search input is regex-escaped before use in MongoDB queries
- `helmet` for standard security headers
- File uploads: type-restricted (JPG/PNG/WEBP) and size-capped (5MB) before ever reaching Cloudinary
- See `TESTING.md` for the full manual test checklist, including the role/ownership boundary tests from the original spec
