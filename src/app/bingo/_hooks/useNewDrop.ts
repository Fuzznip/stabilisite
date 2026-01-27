import { useEffect, useRef, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { Drop } from "@/lib/types/drop";
import { firestore } from "@/lib/config/firebase";
import { revalidateBingo } from "../_actions/revalidateBingo";
import { convertRawDropToDrop } from "@/lib/utils/drop";

const MAX_RETRIES = 15; // Increased from 5 - covers ~9 hours with exponential backoff capped
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 60000; // Cap at 1 minute between retries

export const useNewDrop = () => {
  const [newDrop, setNewDrop] = useState<Drop | undefined>(undefined);
  const firstSnapshotIgnored = useRef<boolean>(false);
  const retryCount = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const subscribe = useCallback(() => {
    try {
      // Check if firestore is available
      if (!firestore) {
        console.warn("Firestore not initialized, skipping subscription");
        return;
      }

      const q = query(
        collection(firestore, "drops"),
        orderBy("timestamp", "desc"),
        limit(1),
      );

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          // Reset retry count on successful snapshot
          retryCount.current = 0;

          if (!firstSnapshotIgnored.current) {
            firstSnapshotIgnored.current = true;
            return;
          }

          if (!snapshot.empty) {
            revalidateBingo();
            const doc = snapshot.docs[0];
            setNewDrop(convertRawDropToDrop(doc.id, doc.data()));
          } else {
            setNewDrop(undefined);
          }
        },
        (error) => {
          // Cleanup current subscription
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }

          // Don't log expected disconnection errors
          const isExpectedDisconnect =
            error.code === "unavailable" ||
            error.message?.includes("connection") ||
            error.message?.includes("closed");

          if (!isExpectedDisconnect) {
            console.error("Error fetching drops:", error.code, error.message);
          }

          // Retry with exponential backoff (capped)
          if (retryCount.current < MAX_RETRIES) {
            const delay = Math.min(
              BASE_DELAY_MS * Math.pow(2, retryCount.current),
              MAX_DELAY_MS,
            );
            retryCount.current += 1;

            retryTimeoutRef.current = setTimeout(() => {
              subscribe();
            }, delay);
          }
        },
      );
    } catch (error) {
      // Catch any synchronous errors during subscription setup
      console.warn("Failed to setup Firestore subscription:", error);

      // Retry with backoff (capped)
      if (retryCount.current < MAX_RETRIES) {
        const delay = Math.min(
          BASE_DELAY_MS * Math.pow(2, retryCount.current),
          MAX_DELAY_MS,
        );
        retryCount.current += 1;

        retryTimeoutRef.current = setTimeout(() => {
          subscribe();
        }, delay);
      }
    }
  }, []);

  useEffect(() => {
    subscribe();

    // Resubscribe when coming back online
    const handleOnline = () => {
      // Reset retry count and resubscribe
      retryCount.current = 0;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      // Small delay to let the connection stabilize
      retryTimeoutRef.current = setTimeout(() => {
        subscribe();
      }, 1000);
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [subscribe]);

  return { newDrop };
};
