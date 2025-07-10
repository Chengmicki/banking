import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Trash2, MessageSquare, AlertTriangle, Gift } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NotificationData {
  _id: string;
  userId: any;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("transaction");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/admin/notifications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/notifications");
      return response.json();
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: async (data: { title: string; message: string; type: string }) => {
      const response = await apiRequest("POST", "/api/admin/notifications/broadcast", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({
        title: "Broadcast Sent",
        description: "Notification has been sent to all users successfully.",
      });
      setIsDialogOpen(false);
      setTitle("");
      setMessage("");
      setType("transaction");
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
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and message.",
        variant: "destructive",
      });
      return;
    }

    broadcastMutation.mutate({ title, message, type });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'promotion':
        return <Gift className="w-5 h-5 text-green-600" />;
      case 'transaction':
      default:
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'security':
        return <Badge variant="destructive">Security</Badge>;
      case 'promotion':
        return <Badge variant="default" className="bg-green-100 text-green-800">Promotion</Badge>;
      case 'transaction':
      default:
        return <Badge variant="secondary">Transaction</Badge>;
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
          <h2 className="text-2xl font-bold text-gray-900">Notification Management</h2>
          <p className="text-gray-600">Send broadcasts and manage user notifications</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {notifications?.length} Total Notifications
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Broadcast Notification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Broadcast Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to all users in the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="security">Security Alert</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter notification message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBroadcast}
                    disabled={broadcastMutation.isPending}
                  >
                    {broadcastMutation.isPending ? "Sending..." : "Send Broadcast"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications?.map((notification: NotificationData) => (
          <Card key={notification._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      {getTypeBadge(notification.type)}
                      {!notification.isRead && (
                        <Badge variant="outline" className="text-xs">Unread</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="text-xs text-gray-400 mt-2 space-x-4">
                      <span>To: {notification.userId?.fullName || notification.userId?.email || 'Unknown'}</span>
                      <span>Sent: {new Date(notification.createdAt).toLocaleDateString()}</span>
                      <span>Status: {notification.isRead ? 'Read' : 'Unread'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">No notifications have been sent yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}