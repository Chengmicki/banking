import { apiRequest } from "./queryClient";

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  permissions: string[];
}

export interface AdminAuthContext {
  admin: Admin | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_DATA_KEY = "admin_data";

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdminData(): Admin | null {
  const data = localStorage.getItem(ADMIN_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function setStoredAdminAuth(token: string, admin: Admin) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admin));
}

export function clearStoredAdminAuth() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
}

export async function adminLogin(username: string, password: string): Promise<{ token: string; admin: Admin }> {
  const response = await apiRequest("POST", "/api/admin/auth/login", {
    username,
    password,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

export async function adminRegister(
  username: string, 
  email: string, 
  password: string,
  role: "super_admin" | "admin" | "moderator" = "admin"
): Promise<{ token: string; admin: Admin }> {
  const response = await apiRequest("POST", "/api/admin/auth/register", {
    username,
    email,
    password,
    role,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
}