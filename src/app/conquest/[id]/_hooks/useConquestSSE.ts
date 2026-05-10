"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { EventLog } from "@/lib/types/v2";

const RECONNECT_DELAY_MS = 3000;

export function useConquestSSE(eventId: string) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function connect() {
      const es = new EventSource(`/api/conquest/${eventId}/stream`);
      esRef.current = es;

      es.onmessage = (e) => {
        const logs: EventLog[] = JSON.parse(e.data);
        const hasControlChange = logs.some(
          (l) => l.type === "TERRITORY_CONTROL" || l.type === "REGION_CONTROL"
        );
        if (hasControlChange) {
          queryClient.invalidateQueries({
            queryKey: ["conquest-territories", eventId],
          });
          queryClient.invalidateQueries({
            queryKey: ["conquest-regions", eventId],
          });
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    }

    connect();

    return () => {
      esRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [eventId, queryClient]);
}
