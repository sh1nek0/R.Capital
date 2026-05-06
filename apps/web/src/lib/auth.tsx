"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { UserRole } from "@capital-os/shared";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterFounderInput = LoginInput & {
  name: string;
  telegram?: string;
  phone?: string;
};

type BootstrapAdminInput = LoginInput & {
  name: string;
};

type AuthContextValue = {
  token?: string;
  user?: AuthUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdminLike: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  registerFounder: (input: RegisterFounderInput) => Promise<AuthUser>;
  createFirstAdmin: (input: BootstrapAdminInput) => Promise<AuthUser>;
  createAdmin: (input: BootstrapAdminInput) => Promise<AuthUser>;
  logout: () => void;
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const tokenStorageKey = "capital-os.auth.token.v1";
const userStorageKey = "capital-os.auth.user.v1";
const localFounderUsersKey = "capital-os.auth.local-founders.v1";
const tokenCookieName = "capital_os_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>();
  const [user, setUser] = useState<AuthUser>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(tokenStorageKey) ?? undefined;
    const storedUser = readStoredUser();

    setToken(storedToken);
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((response: AuthResponse) => {
    window.localStorage.setItem(tokenStorageKey, response.accessToken);
    window.localStorage.setItem(userStorageKey, JSON.stringify(response.user));
    setAuthCookie(response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(tokenStorageKey);
    window.localStorage.removeItem(userStorageKey);
    clearAuthCookie();
    setToken(undefined);
    setUser(undefined);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      try {
        const response = await authRequest<AuthResponse>("/login", input);
        return persistSession(response);
      } catch (error) {
        const localResponse = loginLocalFounder(input);
        if (localResponse && canUseLocalFounderFallback(error)) {
          return persistSession(localResponse);
        }

        throw error;
      }
    },
    [persistSession]
  );

  const registerFounder = useCallback(
    async (input: RegisterFounderInput) => {
      try {
        const response = await authRequest<AuthResponse>("/register", input);
        return persistSession(response);
      } catch (error) {
        if (isApiUnavailable(error)) {
          return persistSession(registerLocalFounder(input));
        }

        throw error;
      }
    },
    [persistSession]
  );

  const createFirstAdmin = useCallback(
    async (input: BootstrapAdminInput) => {
      const response = await authRequest<AuthResponse>("/ensure-first-admin", input);
      return persistSession(response);
    },
    [persistSession]
  );

  const createAdmin = useCallback(
    async (input: BootstrapAdminInput) => {
      const response = await authorizedRequest<AuthUser>(
        "/api/admin/admins",
        input,
        token
      );

      return response;
    },
    [token]
  );

  const authFetch = useCallback(
    (path: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token ?? ""}`);

      return fetch(`${apiBaseUrl()}${path}`, {
        ...init,
        headers
      });
    },
    [token]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      isAdminLike: user?.role === "admin" || user?.role === "analyst",
      login,
      registerFounder,
      createFirstAdmin,
      createAdmin,
      logout,
      authFetch
    }),
    [
      token,
      user,
      isLoading,
      login,
      registerFounder,
      createFirstAdmin,
      createAdmin,
      logout,
      authFetch
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

async function authorizedRequest<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  if (!token) {
    throw new Error("Нужна активная admin-сессия");
  }

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error("Не удалось отправить admin-запрос");
  }

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  return response.json() as Promise<T>;
}

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api/auth${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch {
    throw new AuthRequestError("Не удалось отправить запрос авторизации", 0);
  }

  if (!response.ok) {
    throw new AuthRequestError(await errorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

class AuthRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function errorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    return payload.message ?? "Auth request failed";
  } catch {
    return "Auth request failed";
  }
}

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(userStorageKey);
    return raw ? (JSON.parse(raw) as AuthUser) : undefined;
  } catch {
    return undefined;
  }
}

function setAuthCookie(token: string) {
  document.cookie = `${tokenCookieName}=${token}; path=/; max-age=604800; samesite=lax`;
}

function clearAuthCookie() {
  document.cookie = `${tokenCookieName}=; path=/; max-age=0; samesite=lax`;
}

type LocalFounderRecord = AuthUser & {
  password: string;
  telegram?: string;
  phone?: string;
};

function registerLocalFounder(input: RegisterFounderInput): AuthResponse {
  const users = readLocalFounders();
  const email = input.email.trim().toLowerCase();
  const existing = users.find((item) => item.email === email);

  if (existing) {
    throw new Error("Email уже зарегистрирован в локальном founder-контуре");
  }

  const user: LocalFounderRecord = {
    id: createLocalFounderId(),
    name: input.name.trim(),
    email,
    role: "founder",
    password: input.password,
    telegram: input.telegram,
    phone: input.phone
  };

  writeLocalFounders([user, ...users]);

  return {
    accessToken: createLocalFounderToken(user.id),
    user: toAuthUser(user)
  };
}

function loginLocalFounder(input: LoginInput): AuthResponse | undefined {
  const email = input.email.trim().toLowerCase();
  const user = readLocalFounders().find(
    (item) => item.email === email && item.password === input.password
  );

  if (!user) {
    return undefined;
  }

  return {
    accessToken: createLocalFounderToken(user.id),
    user: toAuthUser(user)
  };
}

function canUseLocalFounderFallback(error: unknown) {
  if (loginLocalFounderExists() && error instanceof AuthRequestError) {
    return error.status === 0 || error.status === 401 || error.status >= 500;
  }

  return isApiUnavailable(error);
}

function loginLocalFounderExists() {
  return readLocalFounders().length > 0;
}

function isApiUnavailable(error: unknown) {
  return (
    error instanceof AuthRequestError &&
    (error.status === 0 ||
      error.status >= 500 ||
      error.status === 503 ||
      error.message.toLowerCase().includes("api недоступен"))
  );
}

function readLocalFounders() {
  try {
    const raw = window.localStorage.getItem(localFounderUsersKey);
    return raw ? (JSON.parse(raw) as LocalFounderRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalFounders(users: LocalFounderRecord[]) {
  window.localStorage.setItem(localFounderUsersKey, JSON.stringify(users));
}

function toAuthUser(user: LocalFounderRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function createLocalFounderId() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `local_founder_${random}`;
}

function createLocalFounderToken(userId: string) {
  return `local_founder.${userId}.${Date.now()}`;
}
