# Architecture

## Logical Architecture

```text
Founder Web App
  -> API Layer
    -> PostgreSQL
    -> Scoring Engine
    -> Routing Engine
    -> Report Engine
    -> Email Service
    -> Opportunity Radar

Internal Admin
  -> API Layer
    -> startups
    -> reports
    -> consultations
    -> opportunities
    -> audit logs
```

## Applications

### apps/web

Next.js application for:

- landing page;
- diagnostic questionnaire;
- diagnostic result;
- consultation request;
- admin preview screens.

### apps/api

NestJS REST API for:

- lead and user creation;
- questionnaire submission;
- scoring;
- routing;
- reports;
- consultations;
- admin operations;
- opportunity management.

### packages/shared

Shared domain enums, labels, and DTO-like TypeScript types.

## Deployment Shape

MVP deployment can use Docker Compose:

- web container;
- api container;
- PostgreSQL;
- Redis;
- S3-compatible storage, added when files/PDFs are enabled.

## Security Requirements

- HTTPS in production;
- RBAC for admin routes;
- audit log for admin actions;
- consent records;
- daily database backups;
- restricted admin access;
- no partner data transfer without explicit consent.

