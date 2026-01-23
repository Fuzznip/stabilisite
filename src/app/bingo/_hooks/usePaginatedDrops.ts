import { useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Drop } from "@/lib/types/drop";
import { firestore } from "@/lib/config/firebase";
import { convertRawDropToDrop } from "@/lib/utils/drop";

const PAGE_SIZE = 10;

export function usePaginatedDrops() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      let q = query(
        collection(firestore, "drops"),
        orderBy("timestamp", "desc"),
        limit(PAGE_SIZE),
      );

      if (lastDoc) {
        q = query(
          collection(firestore, "drops"),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE),
        );
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
      } else {
        const newDrops = snapshot.docs.map((doc) =>
          convertRawDropToDrop(doc.id, doc.data())
        );

        setDrops((prev) => [...prev, ...newDrops]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

        if (snapshot.docs.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching paginated drops:", error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [loading, hasMore, lastDoc]);

  const addDrop = useCallback((drop: Drop) => {
    setDrops((prev) => {
      // Avoid duplicates
      if (prev.some((d) => d.id === drop.id)) {
        return prev;
      }
      return [drop, ...prev];
    });
  }, []);

  return {
    drops,
    loading,
    hasMore,
    loadMore,
    addDrop,
    initialized,
  };
}
