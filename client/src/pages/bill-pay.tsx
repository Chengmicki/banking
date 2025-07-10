import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { 
  Receipt, 
  Zap, 
  Droplets, 
  Flame, 
  CreditCard, 
  Shield, 
  Car,
  Plus,
  CheckCircle
} from "lucide-react";

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: string;
}

interface Payee {
  id: number;
  name: string;
  accountNumber: string;
  category: string;
  isActive: boolean;
}

interface BillPayment {
  id: number;
  payeeId: number;
  accountId: number;
  amount: string;
  dueDate?: string;
  status: string;
  isRecurring: boolean;
  createdAt: string;
}

const categoryIcons = {
  utilities: Zap,
  credit: CreditCard,
  insurance: Shield,
  loans: Car,
};

const mockBills = [
  { id: 1, name: "Electric Company", category: "utilities", amount: "127.45", dueDate: "2025-01-15", icon: Zap, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { id: 2, name: "Water & Sewer", category: "utilities", amount: "89.32", dueDate: "2025-01-20", icon: Droplets, color: "text-blue-600", bgColor: "bg-blue-100" },
  { id: 3, name: "Natural Gas", category: "utilities", amount: "56.78", dueDate: "2025-01-25", icon: Flame, color: "text-red-600", bgColor: "bg-red-100" },
  { id: 4, name: "Credit Card Payment", category: "credit", amount: "250.00", dueDate: "2025-01-18", icon: CreditCard, color: "text-purple-600", bgColor: "bg-purple-100" },
];

export default function BillPay() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("utilities");
  const [newPayeeName, setNewPayeeName] = useState("");
  const [newPayeeAccount, setNewPayeeAccount] = useState("");
  const [newPayeeCategory, setNewPayeeCategory] = useState("");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: payees } = useQuery<Payee[]>({
    queryKey: ["/api/payees"],
    queryFn: async () => {
      const response = await fetch("/api/payees", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: billPayments } = useQuery<BillPayment[]>({
    queryKey: ["/api/bill-payments"],
    queryFn: async () => {
      const response = await fetch("/api/bill-payments", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const addPayeeMutation = useMutation({
    mutationFn: async (payeeData: any) => {
      const response = await fetch("/api/payees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(payeeData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payee Added",
        description: "New payee has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payees"] });
      setNewPayeeName("");
      setNewPayeeAccount("");
      setNewPayeeCategory("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Payee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddPayee = () => {
    if (!newPayeeName || !newPayeeAccount || !newPayeeCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    addPayeeMutation.mutate({
      name: newPayeeName,
      accountNumber: newPayeeAccount,
      category: newPayeeCategory,
    });
  };

  const handlePayBill = (billId: number, amount: string) => {
    toast({
      title: "Payment Initiated",
      description: `Payment of $${amount} has been scheduled.`,
    });
  };

  const filteredBills = mockBills.filter(bill => bill.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bill Pay</h2>
        <Button className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Payment
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bill Payment Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-primary" />
              <span>Pay Bills</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="utilities">Utilities</TabsTrigger>
                <TabsTrigger value="credit">Credit</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
                <TabsTrigger value="loans">Loans</TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory} className="mt-6">
                <div className="space-y-4">
                  {filteredBills.map((bill) => {
                    const Icon = bill.icon;
                    return (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${bill.bgColor} rounded-full flex items-center justify-center`}>
                            <Icon className={`${bill.color} w-5 h-5`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{bill.name}</p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${bill.amount}</p>
                          <Button
                            size="sm"
                            onClick={() => handlePayBill(bill.id, bill.amount)}
                            className="text-primary hover:text-primary-foreground"
                          >
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {/* Add New Payee Section */}
            <div className="border-t pt-6 mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Add New Payee</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payee-name">Company Name</Label>
                  <Input
                    id="payee-name"
                    placeholder="Enter company name"
                    value={newPayeeName}
                    onChange={(e) => setNewPayeeName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payee-account">Account Number</Label>
                  <Input
                    id="payee-account"
                    placeholder="Enter account number"
                    value={newPayeeAccount}
                    onChange={(e) => setNewPayeeAccount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payee-category">Category</Label>
                  <Select value={newPayeeCategory} onValueChange={setNewPayeeCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="credit">Credit Cards</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="loans">Loans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddPayee}
                  disabled={addPayeeMutation.isPending}
                  className="w-full"
                >
                  {addPayeeMutation.isPending ? "Adding..." : "Add Payee"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billPayments?.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {payees?.find(p => p.id === payment.payeeId)?.name || "Unknown Payee"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${parseFloat(payment.amount).toFixed(2)}
                    </p>
                    <p className={`text-sm ${
                      payment.status === 'completed' ? 'text-green-600' :
                      payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </p>
                  </div>
                </div>
              )) || [
                // Mock recent payments for display
                {
                  id: 1,
                  name: "Electric Company",
                  amount: "127.45",
                  date: "Dec 15, 2024",
                  status: "Paid"
                },
                {
                  id: 2,
                  name: "Credit Card Payment",
                  amount: "250.00",
                  date: "Dec 10, 2024",
                  status: "Paid"
                }
              ].map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.name}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${payment.amount}</p>
                    <p className="text-sm text-green-600">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Upcoming Bills Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Due This Week</p>
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-sm text-gray-500">$473.55 total</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Due Next Week</p>
              <p className="text-2xl font-bold text-orange-600">2</p>
              <p className="text-sm text-gray-500">$306.78 total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Paid This Month</p>
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-500">$1,250.00 total</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Auto-Pay Enabled</p>
              <p className="text-2xl font-bold text-blue-600">5</p>
              <p className="text-sm text-gray-500">payees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
