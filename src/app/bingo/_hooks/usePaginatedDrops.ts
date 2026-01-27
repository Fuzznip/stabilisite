import { useState, useCallback, useRef } from "react";
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
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export function usePaginatedDrops() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    const attemptFetch = async (attempt: number): Promise<void> => {
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

        // Reset retry count on success
        retryCountRef.current = 0;

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
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          // Wait with exponential backoff before retrying
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return attemptFetch(attempt + 1);
        }
        // Max retries exceeded
        console.error("Error fetching paginated drops after retries:", err);
        setError("Failed to load drops. Please try again.");
        throw err;
      }
    };

    try {
      await attemptFetch(0);
    } catch {
      // Error already handled in attemptFetch
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

  const retry = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
    loadMore();
  }, [loadMore]);

  return {
    drops,
    loading,
    hasMore,
    loadMore,
    addDrop,
    initialized,
    error,
    retry,
  };
}
