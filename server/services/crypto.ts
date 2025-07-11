export interface CryptoPrice {
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
}

export class CryptoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getCurrentPrices(symbols: string[]): Promise<CryptoPrice[]> {
    try {
      const ids = symbols.map(symbol => this.getCoingeckoId(symbol)).join(',');
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const data = await response.json();

      return symbols.map(symbol => {
        const id = this.getCoingeckoId(symbol);
        const priceData = data[id];

        return {
          symbol: symbol.toUpperCase(),
          name: this.getCryptoName(symbol),
          current_price: priceData?.usd || 0,
          price_change_24h: priceData?.usd_24h_change || 0,
          price_change_percentage_24h: priceData?.usd_24h_change || 0,
        };
      });
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return symbols.map(symbol => ({
        symbol: symbol.toUpperCase(),
        name: this.getCryptoName(symbol),
        current_price: 0,
        price_change_24h: 0,
        price_change_percentage_24h: 0,
      }));
    }
  }

  private getCoingeckoId(symbol: string): string {
    const mapping: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      LTC: 'litecoin',
      XRP: 'ripple',
      ADA: 'cardano',
      DOT: 'polkadot',
    };
    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  private getCryptoName(symbol: string): string {
    const mapping: Record<string, string> = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      LTC: 'Litecoin',
      XRP: 'Ripple',
      ADA: 'Cardano',
      DOT: 'Polkadot',
    };
    return mapping[symbol.toUpperCase()] || symbol;
  }
}

export const cryptoService = new CryptoService();
