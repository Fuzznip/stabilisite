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

export const useNewDrop = () => {
  const [newDrop, setNewDrop] = useState<Drop | undefined>(undefined);
  const firstSnapshotIgnored = useRef<boolean>(false);

  useEffect(() => {
    const q = query(
      collection(firestore, "drops"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("snap", snapshot);
      // Ignore the first snapshot to prevent setting an initial value
      if (!firstSnapshotIgnored.current) {
        firstSnapshotIgnored.current = true;
        console.log("snapshot: ", snapshot);
        return;
      }

      if (!snapshot.empty) {
        revalidateBingo();
        setNewDrop(
          snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
                date: new Date(doc.data().timestamp + "Z"),
              } as Drop)
          )?.[0]
        );
      } else {
        setNewDrop(undefined);
      }
    });

    return () => unsubscribe();
  }, []);

  return { newDrop };
};
