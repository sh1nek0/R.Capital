import { NextRequest, NextResponse } from "next/server";

const publicAdminPaths = ["/admin/login", "/admin/bootstrap"];
const allowedAdminRoles = ["admin", "analyst"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicAdminPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("capital_os_token")?.value;
  if (!token) {
    return redirectToLogin(request, "missing_token");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return redirectToLogin(request, "invalid_token");
  }

  if (!allowedAdminRoles.includes(payload.role)) {
    return redirectToLogin(request, "forbidden");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};

type TokenPayload = {
  role: string;
  exp: number;
};

function redirectToLogin(request: NextRequest, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("reason", reason);
  url.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(url);
}

async function verifyToken(token: string): Promise<TokenPayload | undefined> {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) {
    return undefined;
  }

  const expected = await sign(`${header}.${body}`);
  if (signature !== expected) {
    return undefined;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now ? payload : undefined;
  } catch {
    return undefined;
  }
}

async function sign(input: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.JWT_SECRET ?? "change-me-local"),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(input));

  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return atob(padded);
}

