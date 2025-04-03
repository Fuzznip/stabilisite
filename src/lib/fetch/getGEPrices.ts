export type GEPriceEntry = {
  high: number;
  highTime: number;
  low: number;
  lowTime: number;
};

export type GEPriceResponse = {
  data: Record<string, GEPriceEntry>;
};

export async function getGEPrices(): Promise<Record<string, GEPriceEntry>> {
  const response = await fetch(
    "https://prices.runescape.wiki/api/v1/osrs/latest"
  );
  const data: GEPriceResponse = await response.json();
  return data.data;
}
