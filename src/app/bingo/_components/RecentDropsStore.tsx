"use client";

import React, { createContext, useContext, useCallback, useRef, useState } from "react";
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

type RecentDropsStore = {
  drops: Drop[];
  loading: boolean;
  hasMore: boolean;
  initialized: boolean;
  loadMore: () => Promise<void>;
  addDrop: (drop: Drop) => void;
};

const RecentDropsContext = createContext<RecentDropsStore | undefined>(undefined);

export function RecentDropsProvider({ children }: { children: React.ReactNode }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      let q = query(
        collection(firestore, "drops"),
        orderBy("timestamp", "desc"),
        limit(PAGE_SIZE),
      );

      if (lastDocRef.current) {
        q = query(
          collection(firestore, "drops"),
          orderBy("timestamp", "desc"),
          startAfter(lastDocRef.current),
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
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];

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
  }, [loading, hasMore]);

  const addDrop = useCallback((drop: Drop) => {
    setDrops((prev) => {
      // Avoid duplicates
      if (prev.some((d) => d.id === drop.id)) {
        return prev;
      }
      return [drop, ...prev];
    });
  }, []);

  return (
    <RecentDropsContext.Provider
      value={{
        drops,
        loading,
        hasMore,
        initialized,
        loadMore,
        addDrop,
      }}
    >
      {children}
    </RecentDropsContext.Provider>
  );
}

export function useRecentDrops() {
  const context = useContext(RecentDropsContext);
  if (!context) {
    throw new Error("useRecentDrops must be used within a RecentDropsProvider");
  }
  return context;
}
