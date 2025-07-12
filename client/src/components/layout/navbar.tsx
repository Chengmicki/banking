import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, ArrowLeftRight, Plus, Minus, ShoppingCart, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Navbar({ title, onMenuClick }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  // Fetch recent transactions for bell notification
  const { data: recentTransactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/transactions', 'recent'],
    queryFn: async () => {
      const token = localStorage.getItem('everstead_token');
      
      const response = await fetch('/api/transactions?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user, // Only fetch if user is logged in
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-orange-600" />;
      case 'purchase':
        return <ShoppingCart className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatAmount = (type: string, amount: string) => {
    const numAmount = Math.abs(parseFloat(amount));
    const prefix = type === 'deposit' || parseFloat(amount) > 0 ? '+' : '';
    return `${prefix}$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && !(event.target as Element).closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                refetch();
              }}
              className="bell-button relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="w-6 h-6" />
              {recentTransactions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {recentTransactions.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown fixed right-4 top-16 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Loading transactions...</p>
                  ) : error ? (
                    <p className="text-sm text-red-500 text-center py-4">Error loading transactions</p>
                  ) : recentTransactions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>
                  ) : (
                    recentTransactions.map((transaction: any, index: number) => (
                      <div key={transaction._id || `transaction-${index}`} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.merchantName || transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            transaction.type === 'deposit' || parseFloat(transaction.amount) > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {formatAmount(transaction.type, transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {recentTransactions.length > 0 && (
                  <div className="p-2 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-center text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setShowNotifications(false);
                        window.location.href = '/transactions';
                      }}
                    >
                      View All Transactions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="profile-button flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowProfile(false);
                      logout();
                    }}
                    className="w-full text-left justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
