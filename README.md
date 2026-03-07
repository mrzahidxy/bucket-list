# BucketList MVP

Collaborative bucket list app built with Next.js, MongoDB, JWT auth, and Tailwind.

## Features

- Email/password auth
- Bucket list CRUD
- Item CRUD (add/edit/delete/complete)
- Invite collaborators by email
- Roles: `OWNER`, `EDITOR`, `VIEWER`
- Dashboard (`/dashboard`) + Buckets (`/buckets`)

## Stack

- Next.js 14 + TypeScript
- MongoDB Atlas + Mongoose
- JWT (HttpOnly cookie)
- Zod
- Nodemailer
- Vitest

## Quick Start

1. Install deps

```bash
npm install
```

2. Configure env

```bash
cp .env.example .env
```

3. Run app

```bash
npm run dev
```

App runs at: `http://localhost:3000`

## Environment Variables

Required:

- `MONGODB_URI`
- `JWT_SECRET` (32+ chars)
- `JWT_EXPIRES_IN` (e.g. `7d`)
- `APP_URL` (e.g. `http://localhost:3000`)
- `MOCK_EMAIL` (`true` or `false`)

If `MOCK_EMAIL=false`, also set:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Scripts

- `npm run dev` - dev server
- `npm run build` - production build
- `npm run start` - production server
- `npm run lint` - lint
- `npm test` - tests
- `npm run seed` - seed demo data

## Seed

```bash
npm run seed
```

Demo users:

- `alex@example.com`
- `sarah@example.com`
- `michael@example.com`
- `elena@example.com`

Password: `Password123!`

## Docker

Build image:

```bash
docker build -t bucketlist-mvp:local .
```

Run container:

```bash
docker run --rm -p 3000:3000 \
  -e MONGODB_URI="<your_mongodb_uri>" \
  -e JWT_SECRET="<your_32_plus_char_secret>" \
  -e JWT_EXPIRES_IN="7d" \
  -e APP_URL="http://localhost:3000" \
  -e MOCK_EMAIL="true" \
  bucketlist-mvp:local
```

Or run compose:

```bash
docker compose up --build
```

## GitHub Actions

- `.github/workflows/docker-image.yml`
  - builds and pushes Docker image on `main`
  - requires:
    - `DOCKERHUB_USERNAME`
    - `DOCKERHUB_TOKEN`

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Lists:

- `GET /api/lists`
- `POST /api/lists`
- `GET /api/lists/:id`
- `PATCH /api/lists/:id`
- `DELETE /api/lists/:id`

Items:

- `POST /api/lists/:id/items`
- `PATCH /api/lists/:id/items/:itemId`
- `DELETE /api/lists/:id/items/:itemId`

Invites/Collaborators:

- `POST /api/lists/:id/invitations`
- `POST /api/invitations/accept`
- `GET /api/lists/:id/collaborators`
- `PATCH /api/lists/:id/collaborators/:userId`
- `DELETE /api/lists/:id/collaborators/:userId`
