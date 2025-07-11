import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { ArrowLeftRight, DollarSign, Calendar, Repeat } from 'lucide-react';

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: string;
}

interface Transfer {
  id: number;
  fromAccountId: number;
  toAccountId?: number;
  externalAccount?: string;
  amount: string;
  memo?: string;
  status: string;
  scheduledDate?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  createdAt: string;
}

export default function Transfers() {
  const { toast } = useToast();
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [externalAccount, setExternalAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [transferType, setTransferType] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('');
  const [memo, setMemo] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts', {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: transfers } = useQuery<Transfer[]>({
    queryKey: ['/api/transfers'],
    queryFn: async () => {
      const response = await fetch('/api/transfers', {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (transferData: any) => {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Transfer Successful',
        description: 'Your transfer has been completed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      resetForm();
      setShowReviewModal(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Transfer Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFromAccount('');
    setToAccount('');
    setExternalAccount('');
    setAmount('');
    setTransferType('immediate');
    setScheduledDate('');
    setIsRecurring(false);
    setRecurringFrequency('');
    setMemo('');
  };

  const handleReviewTransfer = () => {
    if (!fromAccount || !amount || (!toAccount && !externalAccount)) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    const selectedAccount = accounts?.find(acc => acc.id.toString() === fromAccount);
    if (selectedAccount && parseFloat(selectedAccount.balance) < parseFloat(amount)) {
      toast({
        title: 'Insufficient Funds',
        description: "You don't have enough balance for this transfer.",
        variant: 'destructive',
      });
      return;
    }

    setShowReviewModal(true);
  };

  const handleConfirmTransfer = () => {
    const transferData = {
      fromAccountId: parseInt(fromAccount),
      toAccountId: toAccount === 'external' ? undefined : parseInt(toAccount),
      externalAccount: toAccount === 'external' ? externalAccount : undefined,
      amount: amount,
      memo: memo || undefined,
      scheduledDate: transferType === 'scheduled' ? scheduledDate : undefined,
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
    };

    transferMutation.mutate(transferData);
  };

  const getAccountDisplay = (account: Account) => {
    return `${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} (****${account.accountNumber.slice(-4)}) - $${parseFloat(account.balance).toFixed(2)}`;
  };

  const getToAccountDisplay = () => {
    if (toAccount === 'external') return 'External Bank Account';
    const account = accounts?.find(acc => acc.id.toString() === toAccount);
    return account
      ? `${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} (****${account.accountNumber.slice(-4)})`
      : '';
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
              <span>Send Money</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from-account">From Account</Label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {getAccountDisplay(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-account">To Account</Label>
              <Select value={toAccount} onValueChange={setToAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    ?.filter(acc => acc.id.toString() !== fromAccount)
                    .map(account => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}{' '}
                        (****{account.accountNumber.slice(-4)})
                      </SelectItem>
                    ))}
                  <SelectItem value="external">External Bank Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {toAccount === 'external' && (
              <div className="space-y-2">
                <Label htmlFor="external-account">External Account Details</Label>
                <Input
                  id="external-account"
                  placeholder="Account number or routing details"
                  value={externalAccount}
                  onChange={e => setExternalAccount(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="pl-10"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Transfer Type</Label>
              <RadioGroup value={transferType} onValueChange={setTransferType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate">Immediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled">Scheduled</Label>
                </div>
              </RadioGroup>
            </div>

            {transferType === 'scheduled' && (
              <div className="space-y-4 pl-6 border-l-2 border-primary">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Schedule Date</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={e => setIsRecurring(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="recurring">Make this recurring</Label>
                </div>

                {isRecurring && (
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Textarea
                id="memo"
                placeholder="Add a note for this transfer..."
                value={memo}
                onChange={e => setMemo(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleReviewTransfer}
              className="w-full btn-gradient"
              disabled={transferMutation.isPending}
            >
              Review Transfer
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers?.slice(0, 5).map(transfer => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ArrowLeftRight className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transfer.externalAccount ? 'To External Account' : 'Internal Transfer'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${parseFloat(transfer.amount).toFixed(2)}
                    </p>
                    <p
                      className={`text-sm ${
                        transfer.status === 'completed'
                          ? 'text-green-600'
                          : transfer.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transfers yet</p>
                  <p className="text-sm">Your transfer history will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">
                {accounts
                  ?.find(acc => acc.id.toString() === fromAccount)
                  ?.accountType.charAt(0)
                  .toUpperCase() +
                  accounts
                    ?.find(acc => acc.id.toString() === fromAccount)
                    ?.accountType.slice(1)}{' '}
                Account
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">
                {getToAccountDisplay()}
                {toAccount === 'external' && externalAccount && ` - ${externalAccount}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium text-lg">${parseFloat(amount || '0').toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">When</p>
              <p className="font-medium">
                {transferType === 'immediate' ? 'Now' : scheduledDate}
                {isRecurring && ` (${recurringFrequency})`}
              </p>
            </div>
            {memo && (
              <div>
                <p className="text-sm text-muted-foreground">Memo</p>
                <p className="font-medium">{memo}</p>
              </div>
            )}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTransfer}
                disabled={transferMutation.isPending}
                className="flex-1 btn-gradient"
              >
                {transferMutation.isPending ? 'Processing...' : 'Confirm Transfer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
