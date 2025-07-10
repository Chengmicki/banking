import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, TrendingUp, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CryptoHolding {
  _id: string;
  userId: any;
  symbol: string;
  name: string;
  amount: string;
  averageCost: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCryptoManagement() {
  const { data: cryptoHoldings, isLoading } = useQuery({
    queryKey: ["/api/admin/crypto"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/crypto");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalValue = cryptoHoldings?.reduce((sum: number, holding: CryptoHolding) => {
    return sum + (parseFloat(holding.amount) * parseFloat(holding.averageCost));
  }, 0) || 0;

  const groupedHoldings = cryptoHoldings?.reduce((acc: {[key: string]: CryptoHolding[]}, holding: CryptoHolding) => {
    if (!acc[holding.symbol]) {
      acc[holding.symbol] = [];
    }
    acc[holding.symbol].push(holding);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crypto Management</h2>
          <p className="text-gray-600">Monitor cryptocurrency holdings across all users</p>
        </div>
        <div className="text-right">
          <Badge variant="secondary">
            {cryptoHoldings?.length} Total Holdings
          </Badge>
          <p className="text-sm text-gray-600 mt-1">
            Total Value: ${totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Summary by Symbol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(groupedHoldings).map(([symbol, holdings]) => {
          const totalAmount = holdings.reduce((sum, h) => sum + parseFloat(h.amount), 0);
          const totalCost = holdings.reduce((sum, h) => sum + (parseFloat(h.amount) * parseFloat(h.averageCost)), 0);
          const avgCost = totalCost / totalAmount || 0;

          return (
            <Card key={symbol}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="w-5 h-5 text-orange-500" />
                    <div>
                      <h3 className="font-medium">{symbol}</h3>
                      <p className="text-sm text-gray-600">{holdings[0].name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{totalAmount.toFixed(8)}</p>
                    <p className="text-sm text-gray-600">${totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Individual Holdings */}
      <div className="grid gap-4">
        {cryptoHoldings?.map((holding: CryptoHolding) => (
          <Card key={holding._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Bitcoin className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {holding.name} ({holding.symbol})
                      </h3>
                      <Badge variant="outline">{holding.symbol}</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {parseFloat(holding.amount).toFixed(8)} {holding.symbol}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Avg Cost: ${parseFloat(holding.averageCost).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-x-4">
                      <span>Owner: {holding.userId?.fullName || holding.userId?.email || 'Unknown'}</span>
                      <span>Total Value: ${(parseFloat(holding.amount) * parseFloat(holding.averageCost)).toFixed(2)}</span>
                      <span>Last Updated: {new Date(holding.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cryptoHoldings?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bitcoin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No crypto holdings found</h3>
            <p className="text-gray-600">No cryptocurrency has been purchased yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}