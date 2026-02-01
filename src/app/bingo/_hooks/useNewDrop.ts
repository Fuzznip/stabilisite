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

const log = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[useNewDrop ${timestamp}] ${message}`, data);
  } else {
    console.log(`[useNewDrop ${timestamp}] ${message}`);
  }
};

export const useNewDrop = () => {
  const [newDrop, setNewDrop] = useState<Drop | undefined>(undefined);
  const firstSnapshotIgnored = useRef<boolean>(false);
  const retryCount = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const subscribe = useCallback(() => {
    log("subscribe() called", { retryCount: retryCount.current });

    try {
      // Check if firestore is available
      if (!firestore) {
        log("Firestore not initialized, skipping subscription");
        return;
      }

      const q = query(
        collection(firestore, "drops"),
        orderBy("timestamp", "desc"),
        limit(1),
      );

      log("Setting up onSnapshot listener");

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          log("Snapshot received", {
            empty: snapshot.empty,
            size: snapshot.size,
            fromCache: snapshot.metadata.fromCache,
            hasPendingWrites: snapshot.metadata.hasPendingWrites,
            firstSnapshotIgnored: firstSnapshotIgnored.current,
          });

          // Reset retry count on successful snapshot
          retryCount.current = 0;

          if (!firstSnapshotIgnored.current) {
            firstSnapshotIgnored.current = true;
            log("First snapshot ignored (initial load)");
            return;
          }

          // Only process if there's an actual document change
          const changes = snapshot.docChanges();
          if (changes.length === 0) {
            log("No document changes, skipping");
            return;
          }

          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            log("New drop detected", { docId: doc.id });
            revalidateBingo();
            setNewDrop(convertRawDropToDrop(doc.id, doc.data()));
          } else {
            log("Empty snapshot, clearing drop");
            setNewDrop(undefined);
          }
        },
        (error) => {
          log("Snapshot error", {
            code: error.code,
            message: error.message,
            name: error.name,
            retryCount: retryCount.current,
          });

          // Cleanup current subscription
          if (unsubscribeRef.current) {
            log("Cleaning up subscription after error");
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }

          // Retry with exponential backoff (capped)
          if (retryCount.current < MAX_RETRIES) {
            const delay = Math.min(
              BASE_DELAY_MS * Math.pow(2, retryCount.current),
              MAX_DELAY_MS,
            );
            retryCount.current += 1;

            log("Scheduling retry", {
              retryNumber: retryCount.current,
              delayMs: delay,
            });

            retryTimeoutRef.current = setTimeout(() => {
              subscribe();
            }, delay);
          } else {
            log("Max retries reached, giving up", { maxRetries: MAX_RETRIES });
          }
        },
      );

      log("onSnapshot listener attached");
    } catch (error) {
      log("Synchronous error during subscription setup", error);

      // Retry with backoff (capped)
      if (retryCount.current < MAX_RETRIES) {
        const delay = Math.min(
          BASE_DELAY_MS * Math.pow(2, retryCount.current),
          MAX_DELAY_MS,
        );
        retryCount.current += 1;

        log("Scheduling retry after sync error", {
          retryNumber: retryCount.current,
          delayMs: delay,
        });

        retryTimeoutRef.current = setTimeout(() => {
          subscribe();
        }, delay);
      } else {
        log("Max retries reached after sync error", { maxRetries: MAX_RETRIES });
      }
    }
  }, []);

  useEffect(() => {
    log("useEffect mounting, initial subscribe");
    subscribe();

    // Resubscribe when coming back online
    const handleOnline = () => {
      log("Online event detected, resubscribing");
      // Reset state and resubscribe
      retryCount.current = 0;
      firstSnapshotIgnored.current = false;
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

    const handleOffline = () => {
      log("Offline event detected");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      log("useEffect cleanup, unsubscribing");
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
