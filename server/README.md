# Server (Backend API)

This is the NestJS backend for Status for Systems.

## Getting Started

```bash
npm install
npm run start:dev
```

The server will start on [http://localhost:3001](http://localhost:3001) by default.

## Scripts

- `npm run start:dev` — Start in development mode
- `npm run start:prod` — Start in production mode
- `npm run build` — Build the app
- `npm run lint` — Lint the codebase
- `npm run test` — Run unit tests
- `npm run test:e2e` — Run end-to-end tests
- `npm run seed:test` — Seed test data
- `npm run seed` — Seed test data via CLI

## Main Dependencies

- @nestjs/common, @nestjs/core, @nestjs/platform-express
- @nestjs/config, @nestjs/jwt, @nestjs/mongoose, @nestjs/passport
- mongoose, passport, passport-jwt, bcrypt
- class-transformer, class-validator
- nest-commander
- rxjs
- typescript

## Code Structure

- Main entry: `src/main.ts`
- App module: `src/app.module.ts`
- Features:
  - Auth: `src/auth/`
  - Groups: `src/groups/`
  - Components: `src/components/`
  - Incidents: `src/incidents/`
  - Controllers: `src/controllers/`
  - Seeders: `src/seeders/`
  - CLI: `src/cli.ts`

## Learn More

- [NestJS Documentation](https://docs.nestjs.com/)
- [Project root README](../README.md)

---

For frontend/dashboard setup, see [../web/README.md](../web/README.md).
