import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { NotificationToast } from "@/components/ui/notification-toast";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Accounts from "@/pages/accounts";
import Transactions from "@/pages/transactions";
import Transfers from "@/pages/transfers";
import BillPay from "@/pages/bill-pay";
import Cards from "@/pages/cards";
import Crypto from "@/pages/crypto";
import Settings from "@/pages/settings";
import AdminLogin from "@/pages/admin-login";
import AdminRegister from "@/pages/admin-register";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminAccounts from "@/pages/admin-accounts";
import AdminTransactions from "@/pages/admin-transactions";
import AdminCards from "@/pages/admin-cards";
import AdminCrypto from "@/pages/admin-crypto";
import AdminNotifications from "@/pages/admin-notifications";
import NotFound from "@/pages/not-found";

const pageTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "Accounts",
  "/transactions": "Transactions",
  "/transfers": "Transfers",
  "/bill-pay": "Bill Pay",
  "/cards": "Cards",
  "/crypto": "Crypto",
  "/settings": "Settings",
};

function AuthenticatedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

  const getCurrentTitle = () => {
    const path = window.location.pathname;
    return pageTitle[path] || "Dashboard";
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:ml-64">
        <Navbar 
          title={getCurrentTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="p-6">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/accounts" component={Accounts} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/transfers" component={Transfers} />
            <Route path="/bill-pay" component={BillPay} />
            <Route path="/cards" component={Cards} />
            <Route path="/crypto" component={Crypto} />
            <Route path="/settings" component={Settings} />
            <Route path="/" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>

      <NotificationToast 
        {...notification}
        onClose={hideNotification}
      />
    </div>
  );
}

function AppRouter() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/accounts" component={AdminAccounts} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/cards" component={AdminCards} />
      <Route path="/admin/crypto" component={AdminCrypto} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/*" component={AdminDashboard} />
      {isAuthenticated ? (
        <Route component={AuthenticatedApp} />
      ) : (
        <Route component={Landing} />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <Toaster />
            <AppRouter />
          </AdminAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
