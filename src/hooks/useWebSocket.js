import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState("CONNECTING");
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("OPEN");
    ws.onclose = () => setStatus("CLOSED");
    ws.onerror = () => setStatus("ERROR");

    ws.onmessage = (e) => setLastMessage(e);

    return () => ws.close();
  }, [url]);

  function send(obj) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(obj));
    }
  }

  return { status, lastMessage, send };
}
