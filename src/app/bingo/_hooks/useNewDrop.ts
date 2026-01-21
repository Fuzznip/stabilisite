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
          setNewDrop(
            snapshot.docs.map((doc) => {
              const data: {
                event_id: string;
                rsn: string;
                discord_id: string;
                trigger: string;
                source: string;
                quantity: string;
                type: string;
                value: string;
                timestamp: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } = doc.data() as any;

              console.log(data);
              return {
                id: doc.id,
                player: data.rsn,
                itemName: data.trigger,
                itemSource: data.source,
                quantity: data.quantity,
                submitType: data.type,
                // Firestore timestamps are in UTC by default; appending "Z" to ensure correct parsing
                date: new Date(data.timestamp + "Z"),
              } as Drop;
            })?.[0],
          );
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
