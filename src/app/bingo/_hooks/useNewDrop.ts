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
import { convertRawDropToDrop } from "@/lib/utils/drop";

export const useNewDrop = () => {
  const [newDrop, setNewDrop] = useState<Drop | undefined>(undefined);
  const firstSnapshotIgnored = useRef<boolean>(true);

  useEffect(() => {
    const q = query(
      collection(firestore, "drops"),
      orderBy("timestamp", "desc"),
      limit(1),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
      (error) =>
        console.error("Error fetching drops: ", error.code, error.message),
    );

    return () => unsubscribe();
  }, []);

  return { newDrop };
};
