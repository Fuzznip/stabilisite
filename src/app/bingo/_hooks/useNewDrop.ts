import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Drop } from "@/lib/types/drop";
import { firestore } from "@/lib/config/firebase";
import { revalidateBingo } from "../_actions/revalidateBingo";
import { convertRawDropToDrop } from "@/lib/utils/drop";

export const useNewDrop = () => {
  const [newDrop, setNewDrop] = useState<Drop | undefined>(undefined);
  const lastDropId = useRef<string | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collection(firestore, "drops"),
      orderBy("timestamp", "desc"),
      limit(1),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) return;

        const doc = snapshot.docs[0];

        // First snapshot on mount — just store the ID, don't toast
        if (lastDropId.current === null) {
          lastDropId.current = doc.id;
          return;
        }

        // Same drop as before, nothing to do
        if (doc.id === lastDropId.current) return;

        // Genuinely new drop
        lastDropId.current = doc.id;
        revalidateBingo();
        setNewDrop(convertRawDropToDrop(doc.id, doc.data()));
      },
      (error) => {
        console.error("[useNewDrop] Snapshot error", error);
      },
    );

    return () => unsubscribe();
  }, []);

  return { newDrop };
};
