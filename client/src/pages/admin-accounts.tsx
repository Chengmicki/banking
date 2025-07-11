import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Edit, Wallet, CreditCard, Shield, ShieldOff, Ban } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Account {
  id: string;
  userId: any;
  accountNumber: string;
  accountType: string;
  balance: string;
  isActive: boolean;
  transactionsBlocked: boolean;
  incomingBlocked: boolean;
  outgoingBlocked: boolean;
  createdAt: string;
}

export default function AdminAccountManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [reason, setReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["/api/admin/accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/accounts");
      return response.json();
    },
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ accountId, balance, reason }: { accountId: string; balance: string; reason: string }) => {
      const response = await apiRequest("PUT", `/api/admin/accounts/${accountId}/balance`, { balance, reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      toast({
        title: "Balance Updated",
        description: "Account balance has been updated successfully.",
      });
      setIsDialogOpen(false);
      setNewBalance("");
      setReason("");
      setSelectedAccount(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const blockTransactionsMutation = useMutation({
    mutationFn: async ({ accountId, blockType, blocked }: { accountId: string; blockType: string; blocked: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/accounts/${accountId}/block-transactions`, { blockType, blocked });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      toast({
        title: "Transaction Block Updated",
        description: "Account transaction restrictions have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBalanceUpdate = () => {
    if (!selectedAccount || !newBalance || !reason) {
      toast({
        title: "Missing Information",
        description: "Please provide both balance and reason for adjustment.",
        variant: "destructive",
      });
      return;
    }

    updateBalanceMutation.mutate({
      accountId: selectedAccount.id,
      balance: newBalance,
      reason,
    });
  };

  const openBalanceDialog = (account: Account) => {
    setSelectedAccount(account);
    setNewBalance(account.balance);
    setIsDialogOpen(true);
  };

  const handleTransactionBlock = (accountId: string, blockType: string, blocked: boolean) => {
    blockTransactionsMutation.mutate({ accountId, blockType, blocked });
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
          <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>
          <p className="text-gray-600">Manage customer accounts and balances</p>
        </div>
        <Badge variant="secondary">
          {accounts?.length} Total Accounts
        </Badge>
      </div>

      <div className="grid gap-4">
        {accounts?.map((account: Account) => (
          <Card key={account.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      {account.accountType === 'credit' ? (
                        <CreditCard className="w-5 h-5 text-green-600" />
                      ) : (
                        <Wallet className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {account.accountNumber}
                      </h3>
                      <Badge variant={account.accountType === 'credit' ? 'destructive' : 'default'}>
                        {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                      </Badge>
                      {!account.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${parseFloat(account.balance).toFixed(2)}
                      </span>
                      {account.userId && (
                        <span>Owner: {account.userId.fullName || account.userId.email || 'Unknown'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {account.transactionsBlocked && (
                        <Badge variant="destructive">All Transactions Blocked</Badge>
                      )}
                      {account.incomingBlocked && (
                        <Badge variant="secondary">Incoming Blocked</Badge>
                      )}
                      {account.outgoingBlocked && (
                        <Badge variant="secondary">Outgoing Blocked</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBalanceDialog(account)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Adjust Balance
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={account.transactionsBlocked}
                        onCheckedChange={(checked) => handleTransactionBlock(account.id, 'all', checked)}
                        disabled={blockTransactionsMutation.isPending}
                      />
                      <Ban className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">Block All Transactions</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={account.incomingBlocked}
                        onCheckedChange={(checked) => handleTransactionBlock(account.id, 'incoming', checked)}
                        disabled={blockTransactionsMutation.isPending}
                      />
                      <ShieldOff className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Block Incoming</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={account.outgoingBlocked}
                        onCheckedChange={(checked) => handleTransactionBlock(account.id, 'outgoing', checked)}
                        disabled={blockTransactionsMutation.isPending}
                      />
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Block Outgoing</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-600">No accounts have been created yet.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Account Balance</DialogTitle>
            <DialogDescription>
              Update the balance for account {selectedAccount?.accountNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentBalance">Current Balance</Label>
              <Input
                id="currentBalance"
                value={selectedAccount ? `$${parseFloat(selectedAccount.balance).toFixed(2)}` : ""}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="newBalance">New Balance</Label>
              <Input
                id="newBalance"
                type="number"
                step="0.01"
                placeholder="Enter new balance"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Adjustment</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this balance adjustment is being made..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBalanceUpdate}
                disabled={updateBalanceMutation.isPending}
              >
                {updateBalanceMutation.isPending ? "Updating..." : "Update Balance"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}