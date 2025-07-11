import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Wallet, PiggyBank, CreditCard } from "lucide-react";
import { authService } from "@/lib/auth";

interface Account {
  _id: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  isActive: boolean;
  createdAt: string;
}

export default function Accounts() {
  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-8 w-8 text-primary" />;
      case 'savings':
        return <PiggyBank className="h-8 w-8 text-green-600" />;
      case 'credit':
        return <CreditCard className="h-8 w-8 text-orange-600" />;
      default:
        return <Wallet className="h-8 w-8 text-gray-600" />;
    }
  };

  const getAccountTitle = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Checking Account';
      case 'savings':
        return 'Savings Account';
      case 'credit':
        return 'Credit Card';
      default:
        return 'Account';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Accounts</h2>
        <Button className="btn-gradient">Open New Account</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts?.map((account) => (
          <Card key={account._id} className="account-card shadow-hover">
            <CardHeader className="flex items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">
                {getAccountTitle(account.accountType)}
              </CardTitle>
              {getAccountIcon(account.accountType)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-mono text-lg">****{account.accountNumber.slice(-4)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">
                  ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {account.accountType === 'savings' && (
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="text-sm font-medium text-green-600">2.5% APY</p>
                </div>
              )}

              {account.accountType === 'credit' && (
                <div>
                  <p className="text-sm text-muted-foreground">Credit Limit</p>
                  <p className="text-sm font-medium text-green-600">$5,000.00</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Link href="/transfers">
                  <Button size="sm" className="flex-1">
                    Transfer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold">{accounts?.length || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                ${accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Available Credit</p>
              <p className="text-2xl font-bold text-green-600">$5,000.00</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Monthly Interest</p>
              <p className="text-2xl font-bold text-purple-600">$12.34</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
