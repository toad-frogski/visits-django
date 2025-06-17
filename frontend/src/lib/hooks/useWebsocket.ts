import { useEffect, useRef } from "react";

type WebSocketMessage = {
  type: string;
  payload: Record<string, any>;
};

type HandlersMap = {
  [eventType: WebSocketMessage["type"]]: (payload: WebSocketMessage["payload"]) => void;
};

type UseWebSocketOptions = {
  url: string;
  handlers: HandlersMap;
  maxRetries?: number;
};

export function useWebSocket({ url, handlers, maxRetries = 3 }: UseWebSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      if (retryCountRef.current > maxRetries) {
        return;
      }

      ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => (retryCountRef.current = 0);

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (data.type && handlers[data.type]) {
            handlers[data.type](data.payload);
          }
        } catch {}
      };

      ws.onclose = () => {
        retryCountRef.current += 1;
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [url, handlers, maxRetries]);
}
