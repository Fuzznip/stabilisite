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

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export const useNewDrop = () => {
  const [newDrop, setNewDrop] = useState<Drop | undefined>(undefined);
  const firstSnapshotIgnored = useRef<boolean>(false);
  const retryCount = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const subscribe = useCallback(() => {
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
        console.error("Error fetching drops: ", error.code, error.message);

        // Cleanup current subscription
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        // Retry with exponential backoff
        if (retryCount.current < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, retryCount.current);
          retryCount.current += 1;
          console.log(`Retrying Firestore connection in ${delay}ms (attempt ${retryCount.current}/${MAX_RETRIES})`);

          retryTimeoutRef.current = setTimeout(() => {
            subscribe();
          }, delay);
        } else {
          console.error("Max retries reached for Firestore connection");
        }
      },
    );
  }, []);

  useEffect(() => {
    subscribe();

    return () => {
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
