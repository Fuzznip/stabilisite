import { useState, useCallback, useEffect } from "react";
import { OsrsItem } from "../types";
import { getGEPrices } from "../fetch/getGEPrices";

export function useOsrsItems() {
  const [results, setResults] = useState<OsrsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<OsrsItem[] | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch(
          "https://prices.runescape.wiki/api/v1/osrs/mapping"
        );
        const data = await res.json();

        const gePrices = await getGEPrices();

        const mappedItems = data
          .map((item: OsrsItem) => {
            const price = gePrices[item.id || ""];
            return {
              id: item.id,
              name: item.name,
              image: `https://oldschool.runescape.wiki/images/${encodeURIComponent(
                item.name.replace(/ /g, "_")
              )}.png`,
              price: price?.high || price?.low || 0,
            };
          })
          .filter((item: { price: number }) => item.price > 2000000);

        setAllItems(mappedItems);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch GE items:", err);
      }
    }
    fetchItems();
  }, []);

  const searchItems = useCallback(
    (query: string) => {
      if (!query || !allItems) return setResults([]);

      const filtered = allItems
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);

      setResults(filtered);
    },
    [allItems]
  );

  return { results, searchItems, loading };
}
