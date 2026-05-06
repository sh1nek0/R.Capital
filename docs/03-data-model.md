# Data Model

## Core Tables

- `users`
- `startups`
- `questionnaire_responses`
- `score_results`
- `route_recommendations`
- `opportunities`
- `reports`
- `consultations`
- `admin_notes`
- `consents`
- `audit_logs`

## Startup Profile

```text
startup_id
user_id
startup_name
description
industry
business_model
client_type
stage
revenue_range
traction_signals
funding_need_amount
funding_need_purpose
preferred_funding_types
prepared_documents
previous_funding_attempts
main_pain
created_at
updated_at
```

## Score Result

```text
grant_score
accelerator_score
pilot_score
angel_score
vc_score
cvc_score
debt_score
document_score
legal_score
explanation_json
```

## Route Recommendation

```text
primary_route
secondary_routes
not_recommended_routes
reasoning
next_steps
```

