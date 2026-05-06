# API Contract v0.1

## Public API

### POST /api/leads

Creates a lightweight lead before or during questionnaire flow.

### POST /api/questionnaire/submit

Creates or updates:

- user;
- startup profile;
- questionnaire responses;
- score result;
- route recommendation;
- report draft.

### GET /api/startups/:id/result

Returns diagnostic result for the founder.

### POST /api/consultations

Creates expert review request.

## Admin API

### GET /api/admin/startups

Filters:

- stage;
- industry;
- route;
- status;
- revenue_range;
- created_from;
- created_to.

### GET /api/admin/startups/:id

Returns full startup card.

### POST /api/admin/startups/:id/recalculate-score

Re-runs scoring and routing.

### PATCH /api/admin/startups/:id/route

Manually updates route recommendation.

### POST /api/admin/startups/:id/generate-report

Generates or regenerates founder report.

### PATCH /api/admin/startups/:id/status

Updates processing status.

### POST /api/admin/startups/:id/notes

Adds internal analyst note.

### Opportunities

```text
GET    /api/admin/opportunities
POST   /api/admin/opportunities
PATCH  /api/admin/opportunities/:id
DELETE /api/admin/opportunities/:id
```

