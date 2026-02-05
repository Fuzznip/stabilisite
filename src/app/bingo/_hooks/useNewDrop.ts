import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { Drop } from "@/lib/types/drop";
import { firestore } from "@/lib/config/firebase";
import { revalidateBingo } from "../_actions/revalidateBingo";
import { revalidateBingoProgress } from "../actions";
import { convertRawDropToDrop } from "@/lib/utils/drop";

export const useNewDrop = () => {
  const [newDrop, setNewDrop] = useState<Drop | undefined>(undefined);
  const lastDropId = useRef<string | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collection(firestore, "drops"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) return;

        const doc = snapshot.docs[0];

        // Baseline not yet established. persistentLocalCache fires a
        // fromCache snapshot first — skip it and wait for the server-
        // confirmed one to set the baseline. This prevents toasting a
        // drop that arrived between the stale cache and now.
        if (lastDropId.current === null) {
          if (snapshot.metadata.fromCache) return;
          lastDropId.current = doc.id;
          return;
        }

        // Same drop as before, nothing to do
        if (doc.id === lastDropId.current) return;

        // Genuinely new drop arrived after baseline was set
        lastDropId.current = doc.id;
        revalidateBingo();
        revalidateBingoProgress();
        setNewDrop(convertRawDropToDrop(doc.id, doc.data()));
      },
      (error) => {
        console.error("[useNewDrop] Snapshot error", error);
      }
    );

    return () => {
      unsubscribe();
      lastDropId.current = null;
    };
  }, []);

  return { newDrop };
};
