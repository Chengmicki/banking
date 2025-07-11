import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { getCryptoPrices, type CryptoPrice } from '@/lib/crypto-api';
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Account {
  _id: string;
  accountNumber: string;
  accountType: string;
  balance: string;
}

interface CryptoHolding {
  _id: string;
  symbol: string;
  name: string;
  amount: string;
  averageCost: string;
  createdAt: string;
}

export default function Crypto() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);

  const supportedCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-600' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-purple-600' },
    { symbol: 'LTC', name: 'Litecoin', icon: 'Ł', color: 'text-gray-600' },
    { symbol: 'XRP', name: 'Ripple', icon: '◉', color: 'text-blue-600' },
  ];

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts', {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: holdings } = useQuery<CryptoHolding[]>({
    queryKey: ['/api/crypto/holdings'],
    queryFn: async () => {
      const response = await fetch('/api/crypto/holdings', {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  // Fetch crypto prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = supportedCryptos.map(crypto => crypto.symbol);
        const prices = await getCryptoPrices(symbols);
        setCryptoPrices(prices);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const buyMutation = useMutation({
    mutationFn: async (buyData: any) => {
      const response = await fetch('/api/crypto/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(buyData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Purchase Successful',
        description: 'Your cryptocurrency purchase has been completed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setAmount('');
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleBuy = () => {
    if (!selectedCrypto || !amount || !paymentAccount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    const price = cryptoPrices.find(p => p.symbol === selectedCrypto)?.current_price || 0;
    const cryptoAmount = parseFloat(amount) / price;

    buyMutation.mutate({
      symbol: selectedCrypto,
      amount: cryptoAmount,
      accountId: paymentAccount,
    });
  };

  const getCurrentPrice = (symbol: string) => {
    return cryptoPrices.find(p => p.symbol === symbol)?.current_price || 0;
  };

  const getPriceChange = (symbol: string) => {
    return cryptoPrices.find(p => p.symbol === symbol)?.price_change_percentage_24h || 0;
  };

  const calculatePortfolioValue = () => {
    if (!holdings || !cryptoPrices.length) return 0;

    return holdings.reduce((total, holding) => {
      const price = getCurrentPrice(holding.symbol);
      return total + parseFloat(holding.amount) * price;
    }, 0);
  };

  const calculatePortfolioChange = () => {
    // Mock calculation - in real app, would need historical data
    return { value: 1234.56, percentage: 1.94 };
  };

  const portfolioValue = calculatePortfolioValue();
  const portfolioChange = calculatePortfolioChange();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cryptocurrency</h2>
        <Button className="btn-gradient">
          <Bitcoin className="w-4 h-4 mr-2" />
          Learn About Crypto
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Portfolio Overview */}
        <Card className="crypto-card text-white shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Crypto Portfolio</span>
              <Bitcoin className="w-6 h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm opacity-70 mb-2">Total Portfolio Value</p>
              <p className="text-3xl font-bold">${portfolioValue.toFixed(2)}</p>
              <div className="flex items-center space-x-2 mt-1">
                {portfolioChange.percentage >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`text-sm ${portfolioChange.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  ${portfolioChange.value.toFixed(2)} ({portfolioChange.percentage >= 0 ? '+' : ''}
                  {portfolioChange.percentage.toFixed(2)}%) today
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {holdings?.length ? (
                holdings.map(holding => {
                  const currentPrice = getCurrentPrice(holding.symbol);
                  const currentValue = parseFloat(holding.amount) * currentPrice;
                  const priceChange = getPriceChange(holding.symbol);
                  const crypto = supportedCryptos.find(c => c.symbol === holding.symbol);

                  return (
                    <div
                      key={holding._id}
                      className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold ${crypto?.color}`}
                        >
                          {crypto?.icon || holding.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{holding.name}</p>
                          <p className="text-sm opacity-70">
                            {holding.amount} {holding.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${currentValue.toFixed(2)}</p>
                        <p
                          className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {priceChange >= 0 ? '+' : ''}
                          {priceChange.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  );
                })
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

        {/* Buy/Sell Interface */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Trade Cryptocurrency</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="crypto-select">Cryptocurrency</Label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCryptos.map(crypto => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${crypto.color}`}>{crypto.icon}</span>
                            <span>
                              {crypto.name} ({crypto.symbol})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Current price: ${getCurrentPrice(selectedCrypto).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
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
                  {amount && (
                    <p className="text-xs text-gray-500">
                      ≈ {(parseFloat(amount) / getCurrentPrice(selectedCrypto)).toFixed(8)}{' '}
                      {selectedCrypto}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map(account => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.accountType.charAt(0).toUpperCase() +
                            account.accountType.slice(1)}{' '}
                          Account (****{account.accountNumber.slice(-4)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {amount && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Network Fee</span>
                      <span>$2.50</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Platform Fee</span>
                      <span>$1.99</span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between font-semibold">
                      <span>Total Cost</span>
                      <span>${(parseFloat(amount || '0') + 4.49).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBuy}
                  disabled={buyMutation.isPending || !amount || !paymentAccount}
                  className="w-full btn-gradient"
                >
                  {buyMutation.isPending ? 'Processing...' : `Buy ${selectedCrypto}`}
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4 mt-6">
                <div className="text-center py-8 text-gray-500">
                  <p>Sell functionality coming soon</p>
                  <p className="text-sm">You'll be able to sell your crypto holdings here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportedCryptos.map(crypto => {
              const price = getCurrentPrice(crypto.symbol);
              const change = getPriceChange(crypto.symbol);

              return (
                <div
                  key={crypto.symbol}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${crypto.color}`}>{crypto.icon}</span>
                      <div>
                        <p className="font-semibold">{crypto.symbol}</p>
                        <p className="text-sm text-gray-500">{crypto.name}</p>
                      </div>
                    </div>
                    {change >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  <div>
                    <p className="text-xl font-bold">${price.toLocaleString()}</p>
                    <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change >= 0 ? '+' : ''}
                      {change.toFixed(2)}% (24h)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
