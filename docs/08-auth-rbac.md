# Auth and RBAC

## Roles

- `founder`: public product user.
- `analyst`: internal operator who can process applications.
- `admin`: internal operator with full admin permissions.

## Backend

Auth endpoints:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/bootstrap-admin
GET  /api/auth/me
```

`/api/auth/register` always creates `founder`.

`/api/auth/bootstrap-admin` creates the first `admin` only when:

- `ADMIN_BOOTSTRAP_TOKEN` matches;
- no admin user exists yet.

Admin API is protected by:

```text
JwtAuthGuard
RolesGuard
@Roles("admin", "analyst")
```

The token payload contains:

```text
sub
email
role
name
iat
exp
```

## Frontend

The frontend stores:

- token in `localStorage`;
- user view in `localStorage`;
- token copy in `capital_os_token` cookie for middleware checks.

Protected routes:

```text
/admin/*
```

Public admin routes:

```text
/admin/login
/admin/bootstrap
```

Founder users are allowed to use product flows but are blocked from admin routes.

