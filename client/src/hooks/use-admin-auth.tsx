import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import {
  type Admin,
  type AdminAuthContext,
  getStoredAdminToken,
  getStoredAdminData,
  setStoredAdminAuth,
  clearStoredAdminAuth,
  adminLogin,
} from '@/lib/admin-auth';

const AdminAuthContext = createContext<AdminAuthContext | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedToken = getStoredAdminToken();
    const storedAdmin = getStoredAdminData();

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(storedAdmin);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { token: newToken, admin: newAdmin } = await adminLogin(username, password);

      setToken(newToken);
      setAdmin(newAdmin);
      setStoredAdminAuth(newToken, newAdmin);

      setLocation('/admin/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    clearStoredAdminAuth();
    setLocation('/admin/login');
  };

  const isAuthenticated = !!(admin && token);

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, isAuthenticated }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
