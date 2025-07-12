import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
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

  // Fetch notifications from API using authService
  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const token = localStorage.getItem('everstead_token');
      console.log('Fetching notifications with token:', token ? 'exists' : 'missing');
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Notifications response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notifications fetch failed:', errorText);
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      console.log('Notifications fetched successfully:', data);
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    enabled: !!user, // Only fetch if user is logged in
  });

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
                console.log('Bell clicked, current state:', showNotifications);
                console.log('Notifications data:', notifications);
                console.log('User:', user);
                console.log('Token exists:', !!localStorage.getItem('everstead_token'));
                setShowNotifications(!showNotifications);
                // Force refetch notifications when clicking bell
                refetch();
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Loading notifications...</p>
                  ) : error ? (
                    <p className="text-sm text-red-500 text-center py-4">Error loading notifications</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                  ) : (
                    notifications.map((notification: any) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'transaction'
                              ? 'bg-blue-500'
                              : notification.type === 'security'
                                ? 'bg-red-500'
                                : 'bg-green-500'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900"
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
