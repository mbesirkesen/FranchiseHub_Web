import { UserRole } from "@/lib/types";

const ACCESS_TOKEN_KEY = "franchisehub_access_token";
const USER_ROLE_KEY = "franchisehub_user_role";

function isBrowser() {
  return typeof window !== "undefined";
}

export function setSession(accessToken: string, role: UserRole) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_ROLE_KEY, role);
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUserRole() {
  if (!isBrowser()) return null;
  return localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
}

export function getRoleFromToken(accessToken: string): UserRole | null {
  const parts = accessToken.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "=",
    );
    const payloadJson = atob(padded);
    const payload = JSON.parse(payloadJson) as { role?: string };

    if (payload.role === "buyer" || payload.role === "franchise_owner") {
      return payload.role;
    }
  } catch {
    return null;
  }

  return null;
}
