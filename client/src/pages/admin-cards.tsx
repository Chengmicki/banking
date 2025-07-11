import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Edit, Trash2, DollarSign, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

interface Card {
  id: string;
  userId: string;
  accountId: string;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  cvv: string;
  isActive: boolean;
  dailyLimit: string;
  monthlyLimit: string;
  createdAt: string;
}

export default function AdminCardManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const [editFormData, setEditFormData] = useState({
    dailyLimit: '',
    monthlyLimit: '',
    isActive: true,
  });

  const { data: cards, isLoading } = useQuery({
    queryKey: ['/api/admin/cards'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/cards');
      return response.json();
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, data }: { cardId: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/cards/${cardId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cards'] });
      toast({
        title: 'Card Updated',
        description: 'Card has been updated successfully.',
      });
      setIsEditDialogOpen(false);
      setSelectedCard(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/cards/${cardId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cards'] });
      toast({
        title: 'Card Deleted',
        description: 'Card has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditCard = (card: Card) => {
    setSelectedCard(card);
    setEditFormData({
      dailyLimit: card.dailyLimit,
      monthlyLimit: card.monthlyLimit,
      isActive: card.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCard = () => {
    if (!selectedCard) return;

    updateCardMutation.mutate({
      cardId: selectedCard.id,
      data: editFormData,
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      deleteCardMutation.mutate(cardId);
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    return showCardNumbers ? cardNumber : `**** **** **** ${cardNumber.slice(-4)}`;
  };

  const getCardTypeColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'debit':
        return 'bg-blue-100 text-blue-800';
      case 'credit':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h2 className="text-2xl font-bold text-gray-900">Card Management</h2>
          <p className="text-gray-600">Manage customer cards and limits</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCardNumbers(!showCardNumbers)}
            >
              {showCardNumbers ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showCardNumbers ? 'Hide' : 'Show'} Card Numbers
            </Button>
          </div>
          <Badge variant="secondary">{cards?.length} Total Cards</Badge>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4">
        {cards?.map((card: Card) => (
          <Card key={card.id} className={`${!card.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {maskCardNumber(card.cardNumber)}
                      </h3>
                      <Badge className={getCardTypeColor(card.cardType)}>{card.cardType}</Badge>
                      {!card.isActive && <Badge variant="destructive">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">Expires: {card.expiryDate}</p>
                    <p className="text-sm text-gray-500">
                      Created: {format(new Date(card.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Daily Limit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${parseFloat(card.dailyLimit).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Monthly Limit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${parseFloat(card.monthlyLimit).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditCard(card)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-600 hover:text-red-700"
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
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No cards found.</p>
        </div>
      )}

      {/* Edit Card Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update card limits and status for{' '}
              {selectedCard?.cardNumber ? maskCardNumber(selectedCard.cardNumber) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dailyLimit" className="text-right">
                Daily Limit
              </Label>
              <Input
                id="dailyLimit"
                type="number"
                step="0.01"
                value={editFormData.dailyLimit}
                onChange={e => setEditFormData(prev => ({ ...prev, dailyLimit: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthlyLimit" className="text-right">
                Monthly Limit
              </Label>
              <Input
                id="monthlyLimit"
                type="number"
                step="0.01"
                value={editFormData.monthlyLimit}
                onChange={e => setEditFormData(prev => ({ ...prev, monthlyLimit: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <Switch
                id="isActive"
                checked={editFormData.isActive}
                onCheckedChange={checked =>
                  setEditFormData(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCard} disabled={updateCardMutation.isPending}>
              {updateCardMutation.isPending ? 'Updating...' : 'Update Card'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
