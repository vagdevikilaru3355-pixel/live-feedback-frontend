import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState("CONNECTING");
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("OPEN");
    ws.onclose = () => setStatus("CLOSED");
    ws.onerror = () => setStatus("ERROR");

    ws.onmessage = (e) => {
      try {
        setLastMessage(JSON.parse(e.data));
      } catch {}
    };

    return () => ws.close();
  }, [url]);

  function send(data) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  return { status, lastMessage, send };
}
