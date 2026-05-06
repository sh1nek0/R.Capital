import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthenticatedUser, AuthUserView } from "./auth.types";

@Injectable()
export class AuthTokenService {
  constructor(private readonly config: ConfigService) {}

  sign(user: AuthUserView): string {
    const now = Math.floor(Date.now() / 1000);
    const ttl = Number(this.config.get<string>("JWT_EXPIRES_IN_SECONDS") ?? 604800);
    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      iat: now,
      exp: now + ttl
    };

    const header = this.encode({ alg: "HS256", typ: "JWT" });
    const body = this.encode(payload);
    const signature = this.signature(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  verify(token: string): AuthenticatedUser {
    const [header, body, signature] = token.split(".");

    if (!header || !body || !signature) {
      throw new UnauthorizedException("Invalid auth token");
    }

    const expected = this.signature(`${header}.${body}`);
    if (!this.isEqual(signature, expected)) {
      throw new UnauthorizedException("Invalid auth token");
    }

    const payload = this.decode<AuthenticatedUser>(body);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      throw new UnauthorizedException("Auth token expired");
    }

    return payload;
  }

  private encode(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
  }

  private decode<T>(value: string): T {
    try {
      return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
    } catch {
      throw new UnauthorizedException("Invalid auth token");
    }
  }

  private signature(input: string) {
    return createHmac("sha256", this.getSecret()).update(input).digest("base64url");
  }

  private getSecret() {
    const secret =
      this.config.get<string>("JWT_SECRET") ??
      (this.config.get<string>("NODE_ENV") === "production"
        ? undefined
        : "change-me-local");
    if (!secret) {
      throw new UnauthorizedException("JWT secret is not configured");
    }

    return secret;
  }

  private isEqual(a: string, b: string) {
    const left = Buffer.from(a);
    const right = Buffer.from(b);

    return left.length === right.length && timingSafeEqual(left, right);
  }
}
