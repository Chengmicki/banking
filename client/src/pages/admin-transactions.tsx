import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ArrowUpRight, ArrowDownLeft, RefreshCw, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Transaction {
  _id: string;
  accountId: any;
  type: string;
  amount: string;
  description: string;
  category?: string;
  merchantName?: string;
  status: string;
  referenceNumber?: string;
  createdAt: string;
}

export default function AdminTransactionManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/transactions");
      return response.json();
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/transactions/${transactionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'transfer':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Management</h2>
          <p className="text-gray-600">Monitor and manage all transactions</p>
        </div>
        <Badge variant="secondary">
          {transactions?.length} Total Transactions
        </Badge>
      </div>

      <div className="grid gap-4">
        {transactions?.map((transaction: Transaction) => (
          <Card key={transaction._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {transaction.description}
                      </h3>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {parseFloat(transaction.amount) >= 0 ? '+' : ''}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </span>
                      <span className="capitalize">{transaction.type}</span>
                      {transaction.category && (
                        <Badge variant="outline" className="text-xs">{transaction.category}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 space-x-4">
                      <span>Account: {transaction.accountId?.accountNumber || 'Unknown'}</span>
                      {transaction.merchantName && (
                        <span>Merchant: {transaction.merchantName}</span>
                      )}
                      {transaction.referenceNumber && (
                        <span>Ref: {transaction.referenceNumber}</span>
                      )}
                      <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTransaction(transaction._id)}
                    disabled={deleteTransactionMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transactions?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">No transactions have been recorded yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}