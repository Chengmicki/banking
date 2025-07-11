import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Wallet, 
  PiggyBank, 
  CreditCard, 
  ArrowLeftRight, 
  Receipt, 
  Bitcoin,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { authService } from "@/lib/auth";

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
  status: string;
}

interface CryptoHolding {
  id: number;
  symbol: string;
  name: string;
  amount: string;
  averageCost: string;
}

export default function Dashboard() {
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions?limit=5", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: cryptoHoldings } = useQuery<CryptoHolding[]>({
    queryKey: ["/api/crypto/holdings"],
    queryFn: async () => {
      const response = await fetch("/api/crypto/holdings", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const totalBalance = accounts?.reduce((sum, account) => sum + parseFloat(account.balance), 0) || 0;
  const checkingAccount = accounts?.find(acc => acc.accountType === 'checking');
  const savingsAccount = accounts?.find(acc => acc.accountType === 'savings');
  const creditAccount = accounts?.find(acc => acc.accountType === 'credit');

  const quickActions = [
    { href: "/transfers", icon: ArrowLeftRight, label: "Transfer", color: "text-blue-600" },
    { href: "/bill-pay", icon: Receipt, label: "Pay Bills", color: "text-green-600" },
    { href: "/cards", icon: CreditCard, label: "Manage Cards", color: "text-purple-600" },
    { href: "/crypto", icon: Bitcoin, label: "Crypto", color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-balance text-white">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium opacity-90">Total Balance</CardTitle>
            <Wallet className="h-6 w-6 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold balance-text">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm opacity-70 mt-2">All accounts combined</p>
          </CardContent>
        </Card>

        <Card className="account-card">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Checking</CardTitle>
            <Wallet className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(checkingAccount?.balance || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              ****{checkingAccount?.accountNumber?.slice(-4)}
            </p>
          </CardContent>
        </Card>

        <Card className="account-card">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Savings</CardTitle>
            <PiggyBank className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(savingsAccount?.balance || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              ****{savingsAccount?.accountNumber?.slice(-4)}
            </p>
          </CardContent>
        </Card>

        <Card className="account-card">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Credit Card</CardTitle>
            <CreditCard className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $0.00
            </div>
            <p className="text-sm text-green-600 mt-2">Available: $5,000.00</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <div className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer">
                    <Icon className={`${action.color} text-2xl mb-2`} />
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions & Crypto */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/transactions">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.length ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item flex items-center justify-between p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' ? 'bg-green-100' :
                        transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <Plus className="text-green-600 w-5 h-5" />
                        ) : transaction.type === 'withdrawal' ? (
                          <Minus className="text-red-600 w-5 h-5" />
                        ) : (
                          <ArrowLeftRight className="text-blue-600 w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-600' :
                      transaction.type === 'withdrawal' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : ''}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions yet</p>
                  <p className="text-sm">Start by making a transfer or deposit</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Crypto Portfolio */}
        <Card className="crypto-card text-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Crypto Portfolio</CardTitle>
            <Link href="/crypto">
              <Button variant="outline" size="sm" className="text-blue-300 border-blue-300 hover:bg-blue-700">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cryptoHoldings?.length ? (
                cryptoHoldings.map((holding) => (
                  <div key={holding.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        holding.symbol === 'BTC' ? 'bg-orange-500' : 'bg-purple-500'
                      }`}>
                        <Bitcoin className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{holding.name}</p>
                        <p className="text-sm opacity-70">{holding.amount} {holding.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(parseFloat(holding.amount) * parseFloat(holding.averageCost)).toFixed(2)}
                      </p>
                      <p className="text-sm text-green-300">+2.34%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-70">
                  <Bitcoin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No crypto holdings yet</p>
                  <p className="text-sm">Start investing in cryptocurrency</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
