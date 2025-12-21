// src/components/StudentCamera.jsx
import React, { useEffect, useRef, useState } from "react";

const WS_HOST = "wss://live-feedback-backend.onrender.com";

export default function StudentCamera({ studentId }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState("starting");

  useEffect(() => {
    async function start() {
      // CAMERA
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStatus("camera-running");

      // WEBSOCKET
      wsRef.current = new WebSocket(
        `${WS_HOST}/ws?role=student&client_id=${studentId}`
      );

      wsRef.current.onopen = () => {
        console.log("Student WS connected");

        // send demo attention event every 5 sec
        setInterval(() => {
          wsRef.current.send(
            JSON.stringify({
              type: "feature",
              ts: Date.now(),
              derived: { events: ["looking-away"] },
            })
          );
        }, 5000);
      };
    }

    start();
  }, [studentId]);

  return (
    <div>
      <h3>Student Camera</h3>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", borderRadius: "12px" }}
      />
      <p>Status: {status}</p>
    </div>
  );
}
