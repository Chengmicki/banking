import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { 
  CreditCard, 
  Wifi, 
  Lock, 
  AlertTriangle, 
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

interface CardData {
  id: number;
  userId: number;
  accountId: number;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  cvv: string;
  isActive: boolean;
  dailyLimit: string;
  monthlyLimit: string;
  createdAt: string;
}

export default function Cards() {
  const { toast } = useToast();
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [internationalTransactions, setInternationalTransactions] = useState(false);
  const [contactlessPayments, setContactlessPayments] = useState(true);
  const [dailyLimit, setDailyLimit] = useState([500]);
  const [monthlyLimit, setMonthlyLimit] = useState([2000]);

  const { data: cards } = useQuery<CardData[]>({
    queryKey: ["/api/cards"],
    queryFn: async () => {
      const response = await fetch("/api/cards", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, updates }: { cardId: number; updates: any }) => {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Updated",
        description: "Your card settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateLimits = () => {
    if (cards && cards.length > 0) {
      updateCardMutation.mutate({
        cardId: cards[0].id,
        updates: {
          dailyLimit: dailyLimit[0].toString(),
          monthlyLimit: monthlyLimit[0].toString(),
        },
      });
    }
  };

  const handleFreezeCard = (cardId: number) => {
    updateCardMutation.mutate({
      cardId,
      updates: { isActive: false },
    });
    toast({
      title: "Card Frozen",
      description: "Your card has been temporarily frozen for security.",
    });
  };

  const handleReportLost = () => {
    toast({
      title: "Card Reported",
      description: "We've received your report. A replacement card will be issued within 3-5 business days.",
    });
  };

  const formatCardNumber = (cardNumber: string, show: boolean = false) => {
    if (show) {
      return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  // Mock card data for display if no cards exist
  const mockCards = [
    {
      id: 1,
      cardType: 'debit',
      cardNumber: '1234567890123456',
      expiryDate: '12/27',
      holderName: 'JOHN DOE',
      isActive: true,
      brand: 'visa'
    },
    {
      id: 2,
      cardType: 'credit',
      cardNumber: '9876543210987654',
      expiryDate: '08/28',
      holderName: 'JOHN DOE',
      isActive: true,
      brand: 'mastercard'
    }
  ];

  const displayCards = cards?.length ? cards : mockCards;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Cards</h2>
        <Button className="btn-gradient">Order New Card</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Card Display */}
        <div className="space-y-6">
          {displayCards.map((card, index) => (
            <Card 
              key={card.id} 
              className={`${
                index === 0 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
                  : 'bg-gradient-to-br from-blue-600 to-blue-800'
              } text-white shadow-hover`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {card.cardType === 'debit' ? 'Debit Card' : 'Credit Card'}
                  </h3>
                  <Wifi className="w-6 h-6" />
                </div>
                
                <div className="mb-6">
                  <p className="font-mono text-xl tracking-widest mb-2">
                    {formatCardNumber(card.cardNumber, showCardNumbers)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-70">VALID THRU</p>
                      <p className="font-mono">{card.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70">CVV</p>
                      <p className="font-mono">{showCardNumbers ? card.cvv || '123' : '***'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">{card.holderName || 'JOHN DOE'}</p>
                  <div className="text-2xl font-bold">
                    {card.brand === 'mastercard' ? '⬤⬤' : 'VISA'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outline"
            onClick={() => setShowCardNumbers(!showCardNumbers)}
            className="w-full"
          >
            {showCardNumbers ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Card Details
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Card Details
              </>
            )}
          </Button>
        </div>

        {/* Card Controls */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Card Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Card Status */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Card Status</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleFreezeCard(displayCards[0].id)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Freeze Card
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleReportLost}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Lost
                </Button>
              </div>
            </div>

            {/* Spending Limits */}
            <div>
              <h4 className="text-sm font-medium mb-4">Spending Limits</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Daily ATM Limit</span>
                    <span className="text-sm font-medium">${dailyLimit[0]}</span>
                  </div>
                  <Slider
                    value={dailyLimit}
                    onValueChange={setDailyLimit}
                    max={1000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$100</span>
                    <span>$1,000</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="progress-bar h-2 rounded-full" 
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">$300 used today</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly Purchase Limit</span>
                    <span className="text-sm font-medium">${monthlyLimit[0]}</span>
                  </div>
                  <Slider
                    value={monthlyLimit}
                    onValueChange={setMonthlyLimit}
                    max={5000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$500</span>
                    <span>$5,000</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="progress-bar h-2 rounded-full" 
                        style={{ width: '35%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">$700 used this month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Categories */}
            <div>
              <h4 className="text-sm font-medium mb-4">Transaction Categories</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Online Purchases</span>
                  <Switch
                    checked={onlinePayments}
                    onCheckedChange={setOnlinePayments}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">International Transactions</span>
                  <Switch
                    checked={internationalTransactions}
                    onCheckedChange={setInternationalTransactions}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contactless Payments</span>
                  <Switch
                    checked={contactlessPayments}
                    onCheckedChange={setContactlessPayments}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t">
              <div className="flex space-x-3">
                <Button 
                  onClick={handleUpdateLimits}
                  disabled={updateCardMutation.isPending}
                  className="flex-1"
                >
                  {updateCardMutation.isPending ? "Updating..." : "Update Limits"}
                </Button>
                <Button variant="outline" className="flex-1">
                  Order New Card
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Activity Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Card Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Transactions Today</p>
              <p className="text-2xl font-bold text-blue-600">7</p>
              <p className="text-sm text-gray-500">$234.56 total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-green-600">43</p>
              <p className="text-sm text-gray-500">$1,567.89 total</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Available Credit</p>
              <p className="text-2xl font-bold text-yellow-600">$4,099</p>
              <p className="text-sm text-gray-500">of $5,000 limit</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Rewards Points</p>
              <p className="text-2xl font-bold text-purple-600">1,247</p>
              <p className="text-sm text-gray-500">$12.47 value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
