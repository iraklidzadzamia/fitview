# Local Runbook

This runbook describes how to run FitView MVP locally.

## 1. Requirements

- Node.js 20+
- PostgreSQL
- Redis
- AWS S3-compatible bucket (or local-compatible endpoint)
- Replicate API token

## 2. Setup

```bash
npm install
cp .env.example .env
```

Fill `.env` with real values before starting services.

## 3. Database

```bash
npx prisma generate
npx prisma migrate dev
```

## 4. Start app

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## 5. Build widget bundle

```bash
npm run widget:build
```

Output: `widget/dist/widget.js`

## 6. Operational checks

- Health endpoint: `GET /api/health`
- Public try-on create: `POST /api/public/tryon`
- Public try-on poll: `GET /api/public/tryon/:id`

## 7. Common issues

- `REDIS_URL missing`: queue connection initialization fails.
- `AWS_* missing`: upload to S3 fails.
- `REPLICATE_API_TOKEN missing`: worker cannot generate try-on image.
- `Origin not allowed`: request origin must exactly match one of `allowedOrigins`.
