export interface CryptoPrice {
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
}

export async function getCryptoPrices(symbols: string[]): Promise<CryptoPrice[]> {
  const response = await fetch(`/api/crypto/prices?symbols=${symbols.join(',')}`);
  if (!response.ok) {
    throw new Error('Failed to fetch crypto prices');
  }
  return response.json();
}
