import { useState, useCallback, useEffect } from "react";
import { OsrsItem } from "../types";

export function useOsrsItems() {
  const [results, setResults] = useState<OsrsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<OsrsItem[] | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();

        setAllItems(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch OSRS items:", err);
        setLoading(false);
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
