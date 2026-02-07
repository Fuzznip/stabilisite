"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Drop } from "@/lib/types/drop";
import { firestore } from "@/lib/config/firebase";
import { convertRawDropToDrop } from "@/lib/utils/drop";

const PAGE_SIZE = 10;

export type DropTypeFilter = "DROP" | "KC" | "SKILL";

// Map our filter types to Firestore 'type' field values
// DROP and LOOT are equivalent in Firestore
// CHAT is grouped with SKILL for filtering purposes
const FILTER_TO_FIRESTORE: Record<DropTypeFilter, string[]> = {
  DROP: ["DROP", "LOOT", "PET"],
  KC: ["KC"],
  SKILL: ["SKILL", "CHAT"],
};

type RecentDropsStore = {
  drops: Drop[];
  loading: boolean;
  hasMore: boolean;
  initialized: boolean;
  activeFilters: Set<DropTypeFilter>;
  setFilters: (filters: Set<DropTypeFilter>) => void;
  loadMore: () => Promise<void>;
  addDrop: (drop: Drop) => void;
};

const RecentDropsContext = createContext<RecentDropsStore | undefined>(
  undefined,
);

export function RecentDropsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<DropTypeFilter>>(
    new Set(["DROP", "KC", "SKILL"]),
  );
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const currentFiltersRef = useRef<Set<DropTypeFilter>>(activeFilters);

  const setFilters = useCallback((filters: Set<DropTypeFilter>) => {
    setActiveFilters(filters);
    currentFiltersRef.current = filters;
    // Reset pagination when filters change
    setDrops([]);
    setHasMore(true);
    setInitialized(false);
    lastDocRef.current = null;
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const filters = currentFiltersRef.current;
    if (filters.size === 0) {
      setInitialized(true);
      setHasMore(false);
      return;
    }

    setLoading(true);

    try {
      const filterValues = Array.from(filters).flatMap(
        (f) => FILTER_TO_FIRESTORE[f],
      );

      let q = query(
        collection(firestore, "drops"),
        where("type", "in", filterValues),
        orderBy("timestamp", "desc"),
        limit(PAGE_SIZE),
      );

      if (lastDocRef.current) {
        q = query(
          collection(firestore, "drops"),
          where("type", "in", filterValues),
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
          convertRawDropToDrop(doc.id, doc.data()),
        );

        setDrops((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const uniqueNewDrops = newDrops.filter((d) => !existingIds.has(d.id));
          return [...prev, ...uniqueNewDrops];
        });
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
    // Check if drop matches active filters
    const filters = currentFiltersRef.current;
    const allowedTypes = Array.from(filters).flatMap(
      (f) => FILTER_TO_FIRESTORE[f],
    );
    if (!allowedTypes.includes(drop.submitType)) {
      return;
    }

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
        activeFilters,
        setFilters,
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
