import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/admin/notifications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/notifications");
      return response.json();
    },
  });

  const broadcastNotificationMutation = useMutation({
    mutationFn: async (data: { title: string; message: string; type: string }) => {
      const response = await apiRequest("POST", "/api/admin/notifications/broadcast", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({
        title: "Notification Sent",
        description: "Broadcast notification has been sent to all users.",
      });
      setIsBroadcastDialogOpen(false);
      setBroadcastData({ title: "", message: "", type: "info" });
    },
    onError: (error: any) => {
      toast({
        title: "Broadcast Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBroadcast = () => {
    if (!broadcastData.title || !broadcastData.message) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and message for the notification.",
        variant: "destructive",
      });
      return;
    }

    broadcastNotificationMutation.mutate(broadcastData);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Management</h2>
          <p className="text-gray-600">Manage and broadcast notifications to users</p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Broadcast Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Broadcast Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to all users in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={broadcastData.title}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={broadcastData.type}
                    onValueChange={(value) => setBroadcastData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="message" className="text-right pt-2">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    className="col-span-3"
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBroadcast} disabled={broadcastNotificationMutation.isPending}>
                  {broadcastNotificationMutation.isPending ? "Sending..." : "Send Broadcast"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Badge variant="secondary">
            {notifications?.length} Total Notifications
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} Unread
            </Badge>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="grid gap-4">
        {notifications?.map((notification: Notification) => (
          <Card key={notification.id} className={`${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <Badge className={getNotificationColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <Badge variant="secondary">Unread</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Mark as read/unread functionality could be added here
                      toast({
                        title: "Notification Action",
                        description: "Feature can be implemented as needed.",
                      });
                    }}
                  >
                    {notification.isRead ? "Mark Unread" : "Mark Read"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications?.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications found.</p>
        </div>
      )}
    </div>
  );
}