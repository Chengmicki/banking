import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, ArrowLeftRight, ShoppingCart } from "lucide-react";
import { authService } from "@/lib/auth";

interface Transaction {
  id: number;
  accountId: number;
  type: string;
  amount: string;
  description: string;
  category?: string;
  merchantName?: string;
  status: string;
  referenceNumber?: string;
  createdAt: string;
}

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchantName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="text-green-600 w-5 h-5" />;
      case 'withdrawal':
        return <Minus className="text-red-600 w-5 h-5" />;
      case 'transfer':
        return <ArrowLeftRight className="text-blue-600 w-5 h-5" />;
      default:
        return <ShoppingCart className="text-gray-600 w-5 h-5" />;
    }
  };

  const getAmountColor = (type: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (type === 'deposit' || numAmount > 0) return 'text-green-600';
    if (type === 'withdrawal' || numAmount < 0) return 'text-red-600';
    return 'text-blue-600';
  };

  const formatAmount = (type: string, amount: string) => {
    const numAmount = Math.abs(parseFloat(amount));
    const prefix = type === 'deposit' || parseFloat(amount) > 0 ? '+' : '';
    return `${prefix}$${numAmount.toFixed(2)}`;
  };

  const totalInflows = filteredTransactions
    .filter(t => t.type === 'deposit' || parseFloat(t.amount) > 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  const totalOutflows = filteredTransactions
    .filter(t => t.type === 'withdrawal' || parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="60">Last 60 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 bg-green-50">
            <p className="text-sm text-muted-foreground">Total Inflows</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 bg-red-50">
            <p className="text-sm text-muted-foreground">Total Outflows</p>
            <p className="text-2xl font-bold text-red-600">
              ${totalOutflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 bg-blue-50">
            <p className="text-sm text-muted-foreground">Net Balance</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(totalInflows - totalOutflows).toLocaleString('en-US', { minimumFractionDigits: 2, signDisplay: 'always' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredTransactions.length ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="transaction-item flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-100' :
                      transaction.type === 'withdrawal' ? 'bg-red-100' : 
                      transaction.type === 'transfer' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.merchantName || transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.referenceNumber && (
                        <p className="text-xs text-muted-foreground">
                          Ref: {transaction.referenceNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getAmountColor(transaction.type, transaction.amount)}`}>
                      {formatAmount(transaction.type, transaction.amount)}
                    </p>
                    <p className={`text-sm ${
                      transaction.status === 'completed' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || typeFilter !== "all" 
                    ? "Try adjusting your filters"
                    : "Your transactions will appear here"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'}
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
