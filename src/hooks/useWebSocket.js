// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

export default function useWebSocket(url) {
  const [status, setStatus] = useState("CONNECTING");
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => setStatus("OPEN");
    ws.onclose = () => setStatus("CLOSED");
    ws.onerror = () => setStatus("ERROR");

    ws.onmessage = (e) => setLastMessage(e);

    return () => ws.close();
  }, [url]);

  const sendJson = useCallback((obj) => {
    const ws = socketRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }, []);

  return { status, lastMessage, sendJson };
}
