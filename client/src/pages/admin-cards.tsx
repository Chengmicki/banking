import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CardInfo {
  _id: string;
  userId: any;
  accountId: any;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  isActive: boolean;
  dailyLimit: string;
  monthlyLimit: string;
  createdAt: string;
}

export default function AdminCardManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [showSensitiveData, setShowSensitiveData] = useState<{[key: string]: boolean}>({});

  const { data: cards, isLoading } = useQuery({
    queryKey: ["/api/admin/cards"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/cards");
      return response.json();
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, data }: { cardId: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/cards/${cardId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      toast({
        title: "Card Updated",
        description: "Card has been updated successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/cards/${cardId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      toast({
        title: "Card Deleted",
        description: "Card has been deleted successfully.",
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

  const handleActiveToggle = (cardId: string, currentValue: boolean) => {
    updateCardMutation.mutate({
      cardId,
      data: { isActive: !currentValue },
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      deleteCardMutation.mutate(cardId);
    }
  };

  const openEditDialog = (card: CardInfo) => {
    setSelectedCard(card);
    setDailyLimit(card.dailyLimit);
    setMonthlyLimit(card.monthlyLimit);
    setIsDialogOpen(true);
  };

  const handleUpdateLimits = () => {
    if (!selectedCard) return;

    updateCardMutation.mutate({
      cardId: selectedCard._id,
      data: {
        dailyLimit,
        monthlyLimit,
      },
    });
  };

  const toggleSensitiveData = (cardId: string) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const maskCardNumber = (cardNumber: string, show: boolean) => {
    if (show) return cardNumber;
    return cardNumber.slice(0, 4) + ' **** **** ' + cardNumber.slice(-4);
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
          <h2 className="text-2xl font-bold text-gray-900">Card Management</h2>
          <p className="text-gray-600">Manage customer credit and debit cards</p>
        </div>
        <Badge variant="secondary">
          {cards?.length} Total Cards
        </Badge>
      </div>

      <div className="grid gap-4">
        {cards?.map((card: CardInfo) => (
          <Card key={card._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {card.cardholderName}
                      </h3>
                      <Badge variant={card.cardType === 'credit' ? 'destructive' : 'default'}>
                        {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}
                      </Badge>
                      {!card.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="font-mono">
                          {maskCardNumber(card.cardNumber, showSensitiveData[card._id])}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSensitiveData(card._id)}
                        >
                          {showSensitiveData[card._id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {showSensitiveData[card._id] && (
                        <div className="text-sm text-gray-500 space-x-4">
                          <span>Expiry: {card.expiryDate}</span>
                          <span>CVV: {card.cvv}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 space-x-4">
                        <span>Daily: ${parseFloat(card.dailyLimit).toFixed(2)}</span>
                        <span>Monthly: ${parseFloat(card.monthlyLimit).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span>Account: {card.accountId?.accountNumber || 'Unknown'}</span>
                        <span className="ml-4">Owner: {card.userId?.fullName || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={card.isActive}
                      onCheckedChange={() => handleActiveToggle(card._id, card.isActive)}
                    />
                    <span className="text-sm text-gray-600">Active</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(card)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCard(card._id)}
                      disabled={deleteCardMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cards?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
            <p className="text-gray-600">No cards have been issued yet.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card Limits</DialogTitle>
            <DialogDescription>
              Update spending limits for {selectedCard?.cardholderName}'s card
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dailyLimit">Daily Limit</Label>
              <Input
                id="dailyLimit"
                type="number"
                step="0.01"
                placeholder="Enter daily limit"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="monthlyLimit">Monthly Limit</Label>
              <Input
                id="monthlyLimit"
                type="number"
                step="0.01"
                placeholder="Enter monthly limit"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateLimits}
                disabled={updateCardMutation.isPending}
              >
                {updateCardMutation.isPending ? "Updating..." : "Update Limits"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}