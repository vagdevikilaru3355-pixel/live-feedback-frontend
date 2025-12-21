import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState("CONNECTING");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("OPEN");
    ws.onclose = () => setStatus("CLOSED");
    ws.onerror = () => setStatus("ERROR");

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setMessages((prev) => [...prev, msg]);
      } catch { }
    };

    return () => ws.close();
  }, [url]);

  const send = (data) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { status, messages, send };
}
