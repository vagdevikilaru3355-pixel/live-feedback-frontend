import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url) {
  const [status, setStatus] = useState("connecting");
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("OPEN");
    ws.onclose = () => setStatus("CLOSED");
    ws.onerror = () => setStatus("ERROR");

    ws.onmessage = (event) => {
      try {
        setLastMessage(JSON.parse(event.data));
      } catch {
        console.warn("Invalid WS message", event.data);
      }
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { status, lastMessage };
}
