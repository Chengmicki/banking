import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'everstead_token';
  private userKey = 'everstead_user';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuth(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", { fullName, email, password });
    const data = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  logout(): void {
    this.clearAuth();
    window.location.href = '/';
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
