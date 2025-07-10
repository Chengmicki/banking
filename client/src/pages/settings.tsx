import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Settings as SettingsIcon,
  CheckCircle,
  Smartphone,
  Mail,
  Lock
} from "lucide-react";

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const response = await fetch("/api/user/profile", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFullName(data.fullName);
      setPhone(data.phone || "");
      setAddress(data.address || "");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      fullName,
      phone,
      address,
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password Change",
      description: "Password change functionality will be implemented here.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export will be prepared and sent to your email within 24 hours.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">Email cannot be changed for security reasons</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Identity Verified</p>
                    <p className="text-sm text-green-700">Your account is fully verified</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Account Secure</p>
                    <p className="text-sm text-blue-700">All security features enabled</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password */}
              <div>
                <h4 className="text-sm font-medium mb-3">Password</h4>
                <Button variant="outline" onClick={handleChangePassword} className="w-full justify-between">
                  <span>Change Password</span>
                  <Lock className="w-4 h-4" />
                </Button>
              </div>

              {/* Two-Factor Authentication */}
              <div>
                <h4 className="text-sm font-medium mb-3">Two-Factor Authentication</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">SMS Authentication</p>
                        <p className="text-sm text-gray-500">Receive codes via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Authenticator App</p>
                        <p className="text-sm text-gray-500">Use Google Authenticator or similar</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Setup</Button>
                  </div>
                </div>
              </div>

              {/* Login Sessions */}
              <div>
                <h4 className="text-sm font-medium mb-3">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on Windows • New York, NY</p>
                      <p className="text-xs text-gray-400">Last active: Now</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-gray-500">iPhone App • New York, NY</p>
                      <p className="text-xs text-gray-400">Last active: 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h4 className="text-sm font-medium mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Transaction alerts</span>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Security alerts</span>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Account updates</span>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h4 className="text-sm font-medium mb-3">Push Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Mobile app notifications</span>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Browser notifications</span>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div>
                <h4 className="text-sm font-medium mb-3">SMS Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Security codes</span>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Large transactions</span>
                    </div>
                    <Switch
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-primary" />
                <span>Privacy & Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Export */}
              <div>
                <h4 className="text-sm font-medium mb-3">Data Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Export my data</p>
                      <p className="text-sm text-gray-500">Download a copy of your account data</p>
                    </div>
                    <Button variant="outline" onClick={handleExportData}>
                      Export
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Delete my account</p>
                      <p className="text-sm text-gray-500">Permanently remove your account and data</p>
                    </div>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h4 className="text-sm font-medium mb-3">Privacy Controls</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Share usage analytics</span>
                    <Switch checked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing communications</span>
                    <Switch checked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Third-party data sharing</span>
                    <Switch checked={false} disabled />
                  </div>
                </div>
              </div>

              {/* Legal Documents */}
              <div>
                <h4 className="text-sm font-medium mb-3">Legal Documents</h4>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Terms of Service
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Privacy Policy
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Cookie Policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
