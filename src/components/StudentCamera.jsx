import React, { useEffect, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function StudentCamera({ name, room }) {
  const videoRef = useRef(null);
  const wsUrl = `${WS_BASE}/ws?role=student&client_id=${name}&room=${room}`;
  const { send } = useWebSocket(wsUrl);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });

    const interval = setInterval(() => {
      send({
        type: "attention_state",
        id: name,
        state: "looking_straight",
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>Student Camera</h3>
      <video ref={videoRef} autoPlay muted />
    </div>
  );
}
