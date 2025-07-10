import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  ArrowRightLeft, 
  Bitcoin, 
  Bell,
  LogOut,
  Shield,
  Database,
  Activity
} from "lucide-react";
import AdminUserManagement from "./admin-users";
import AdminAccountManagement from "./admin-accounts";
import AdminTransactionManagement from "./admin-transactions";
import AdminCardManagement from "./admin-cards";
import AdminCryptoManagement from "./admin-crypto";
import AdminNotificationManagement from "./admin-notifications";

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Everstead Bank Admin</h1>
                <p className="text-sm text-gray-500">Banking Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin?.username}</p>
                <Badge variant="secondary" className="text-xs">
                  {admin?.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.stats.activeUsers} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.stats.totalBalance}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {stats?.stats.totalAccounts} accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.stats.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    ${stats?.stats.totalTransactionVolume} volume
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.stats.activeCards}</div>
                  <p className="text-xs text-muted-foreground">
                    Of {stats?.stats.totalCards} total cards
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transfers</span>
                      <span className="font-medium">{stats?.stats.totalTransfers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Crypto Holdings</span>
                      <span className="font-medium">{stats?.stats.totalCryptoHoldings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transaction Volume</span>
                      <span className="font-medium">${stats?.stats.totalTransactionVolume}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => setActiveTab("users")} variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button onClick={() => setActiveTab("accounts")} variant="outline" size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Accounts
                    </Button>
                    <Button onClick={() => setActiveTab("transactions")} variant="outline" size="sm">
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Transactions
                    </Button>
                    <Button onClick={() => setActiveTab("notifications")} variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Send Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="accounts">
            <AdminAccountManagement />
          </TabsContent>

          <TabsContent value="transactions">
            <AdminTransactionManagement />
          </TabsContent>

          <TabsContent value="cards">
            <AdminCardManagement />
          </TabsContent>

          <TabsContent value="crypto">
            <AdminCryptoManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotificationManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}