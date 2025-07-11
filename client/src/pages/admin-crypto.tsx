import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bitcoin, TrendingUp, TrendingDown, DollarSign, Search, BarChart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface CryptoHolding {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  amount: string;
  averageCost: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCryptoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("all");

  const { data: cryptoHoldings, isLoading } = useQuery({
    queryKey: ["/api/admin/crypto"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/crypto");
      return response.json();
    },
  });

  const getCryptoIcon = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case "BTC":
        return <Bitcoin className="w-5 h-5 text-orange-500" />;
      case "ETH":
        return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Ξ</div>;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSymbolColor = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case "BTC":
        return "bg-orange-100 text-orange-800";
      case "ETH":
        return "bg-blue-100 text-blue-800";
      case "ADA":
        return "bg-purple-100 text-purple-800";
      case "DOT":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredHoldings = cryptoHoldings?.filter((holding: CryptoHolding) => {
    const matchesSearch = holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         holding.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSymbol = symbolFilter === "all" || holding.symbol === symbolFilter;
    return matchesSearch && matchesSymbol;
  });

  const uniqueSymbols = [...new Set(cryptoHoldings?.map((h: CryptoHolding) => h.symbol) || [])];

  const totalValue = filteredHoldings?.reduce((sum: number, holding: CryptoHolding) => {
    return sum + (parseFloat(holding.amount) * parseFloat(holding.averageCost));
  }, 0) || 0;

  const totalAmount = filteredHoldings?.reduce((sum: number, holding: CryptoHolding) => {
    return sum + parseFloat(holding.amount);
  }, 0) || 0;

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
          <h2 className="text-2xl font-bold text-gray-900">Crypto Holdings Management</h2>
          <p className="text-gray-600">Monitor customer cryptocurrency portfolios</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {filteredHoldings?.length} Holdings
          </Badge>
          <Badge variant="outline">
            Total Value: ${totalValue.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredHoldings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {uniqueSymbols.length} different cryptocurrencies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Combined portfolio value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Bitcoin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toFixed(8)}</div>
            <p className="text-xs text-muted-foreground">
              Total cryptocurrency units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={symbolFilter} onValueChange={setSymbolFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by cryptocurrency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cryptocurrencies</SelectItem>
            {uniqueSymbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Holdings List */}
      <div className="grid gap-4">
        {filteredHoldings?.map((holding: CryptoHolding) => (
          <Card key={holding.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {getCryptoIcon(holding.symbol)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {holding.name}
                      </h3>
                      <Badge className={getSymbolColor(holding.symbol)}>
                        {holding.symbol.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      User ID: {holding.userId}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last Updated: {format(new Date(holding.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {parseFloat(holding.amount).toFixed(8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Cost</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${parseFloat(holding.averageCost).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${(parseFloat(holding.amount) * parseFloat(holding.averageCost)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHoldings?.length === 0 && (
        <div className="text-center py-12">
          <Bitcoin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No crypto holdings found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}