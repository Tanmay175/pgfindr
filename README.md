# PGFindr

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
- [ ] Phase 8 — Dashboards, notifications, UI polish
- [ ] Phase 9 — Security hardening, validation, testing
