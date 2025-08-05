import { firestore } from "@/lib/config/firebase";
import { Tile } from "@/lib/types/tile";
import { collection, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";

export function useBingoBoard(): {
  tiles: Tile[];
  loading: boolean;
  error: string | null;
} {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const tilesCollection = collection(firestore, "tiles");
    const unsubscribe = onSnapshot(
      tilesCollection,
      (snapshot) => {
        const tilesData = snapshot.docs.map((doc) => {
          const tile = doc.data() as Tile;
          return {
            ...tile,
            id: doc.id,
          };
        }) as Tile[];
        setTiles(tilesData.sort((tileA, tileB) => tileA.tile - tileB.tile));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { tiles, loading, error };
}
