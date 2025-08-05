import { firestore } from "@/lib/config/firebase";
import { Tile } from "@/lib/types/tile";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect, useCallback } from "react";

export function useTile(id: string): {
  tile?: Tile;
  loading: boolean;
  error: string | null;
} {
  const [tile, setTile] = useState<Tile | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTile = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const tileRef = doc(firestore, "tiles", id);
      const tileSnap = await getDoc(tileRef);

      if (tileSnap.exists()) {
        setTile(tileSnap.data() as Tile);
      } else {
        setTile(undefined);
        setError("Tile not found");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTile();
  }, [fetchTile]);

  return { tile, loading, error };
}
