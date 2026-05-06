import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const allowedActions = new Set([
  "login",
  "register",
  "bootstrap-admin",
  "ensure-first-admin"
]);

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "founder" | "analyst" | "admin";
};

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  const action = params.action;
  if (!allowedActions.has(action)) {
    return NextResponse.json({ message: "Unknown auth action" }, { status: 404 });
  }

  const body = await request.json();
  const proxied = await proxyToApi(action, body);
  if (proxied) {
    if (isDevAuthFallbackEnabled() && proxied.status >= 500) {
      const fallback = devAuthFallback(action, body, request);
      if (fallback) {
        return fallback;
      }
    }

    if (
      (action === "bootstrap-admin" || action === "ensure-first-admin") &&
      isDevAuthFallbackEnabled() &&
      proxied.status >= 500
    ) {
      return firstAdminFallback(body, action);
    }

    return proxied;
  }

  if (isDevAuthFallbackEnabled()) {
    const fallback = devAuthFallback(action, body, request);
    if (fallback) {
      return fallback;
    }
  }

  if (
    (action === "bootstrap-admin" || action === "ensure-first-admin") &&
    isDevAuthFallbackEnabled()
  ) {
    return firstAdminFallback(body, action);
  }

  return NextResponse.json(
    {
      message:
        "API недоступен. Запусти backend на localhost:4000 или используй dev bootstrap для первого администратора."
    },
    { status: 503 }
  );
}

function devAuthFallback(action: string, body: unknown, request: NextRequest) {
  if (action === "register") {
    return founderFallback(body);
  }

  if (action === "login") {
    return loginFallback(body, request);
  }

  if (action === "bootstrap-admin" || action === "ensure-first-admin") {
    return firstAdminFallback(body, action);
  }

  return undefined;
}

async function proxyToApi(action: string, body: unknown) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json"
      }
    });
  } catch {
    return undefined;
  }
}

function firstAdminFallback(body: unknown, action: string) {
  const payload = body as {
    bootstrapToken?: string;
    name?: string;
    email?: string;
    password?: string;
  };

  if (action === "bootstrap-admin" && payload.bootstrapToken !== bootstrapToken()) {
    return NextResponse.json(
      { message: "Некорректный токен первичной настройки" },
      { status: 401 }
    );
  }

  if (!payload.email || !payload.password || payload.password.length < 8) {
    return NextResponse.json(
      { message: "Укажи email и пароль минимум 8 символов" },
      { status: 400 }
    );
  }

  const user: AuthUser = {
    id: "dev_admin",
    name: payload.name || "Администратор Capital OS",
    email: payload.email.trim().toLowerCase(),
    role: "admin"
  };

  return NextResponse.json({
    accessToken: signToken(user),
    user
  });
}

function founderFallback(body: unknown) {
  const payload = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!payload.name || payload.name.trim().length < 2) {
    return NextResponse.json({ message: "Укажи имя фаундера" }, { status: 400 });
  }

  if (!payload.email || !payload.password || payload.password.length < 8) {
    return NextResponse.json(
      { message: "Укажи email и пароль минимум 8 символов" },
      { status: 400 }
    );
  }

  const user: AuthUser = {
    id: `dev_founder_${hashId(payload.email)}`,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    role: "founder"
  };

  return NextResponse.json({
    accessToken: signToken(user),
    user
  });
}

function loginFallback(body: unknown, request: NextRequest) {
  const payload = body as {
    email?: string;
    password?: string;
  };

  if (!payload.email || !payload.password || payload.password.length < 8) {
    return NextResponse.json(
      { message: "Укажи email и пароль минимум 8 символов" },
      { status: 400 }
    );
  }

  const email = payload.email.trim().toLowerCase();
  const referer = request.headers.get("referer") ?? "";
  const wantsAdmin =
    referer.includes("/admin/login") ||
    email.includes("admin") ||
    email === process.env.DEV_ADMIN_EMAIL?.trim().toLowerCase();
  const user: AuthUser = {
    id: wantsAdmin ? "dev_admin" : `dev_founder_${hashId(email)}`,
    name: wantsAdmin ? "Администратор Capital OS" : email.split("@")[0],
    email,
    role: wantsAdmin ? "admin" : "founder"
  };

  return NextResponse.json({
    accessToken: signToken(user),
    user
  });
}

function signToken(user: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 604800);
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const body = base64UrlJson({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp
  });
  const signature = createHmac("sha256", jwtSecret())
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function jwtSecret() {
  return process.env.JWT_SECRET ?? "change-me-local";
}

function bootstrapToken() {
  return process.env.ADMIN_BOOTSTRAP_TOKEN ?? "change-me-bootstrap";
}

function isDevAuthFallbackEnabled() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    process.env.NODE_ENV !== "production" &&
    (apiBaseUrl.includes("localhost") ||
      apiBaseUrl.includes("127.0.0.1") ||
      process.env.DEV_AUTH_FALLBACK === "true")
  );
}

function hashId(value: string) {
  return createHmac("sha256", jwtSecret())
    .update(value.trim().toLowerCase())
    .digest("hex")
    .slice(0, 12);
}
