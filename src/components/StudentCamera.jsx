import React, { useEffect, useRef, useState } from "react";

export default function StudentCamera({ studentId }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState("starting");

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        videoRef.current.srcObject = stream;
        setStatus("camera-on");
      } catch (e) {
        console.error("Student camera error", e);
        setStatus("permission-denied");
      }
    }

    startCamera();

    wsRef.current = new WebSocket(
      "wss://live-feedback-backend.onrender.com/ws?role=student&client_id=" +
      studentId
    );

    return () => {
      wsRef.current?.close();
      videoRef.current?.srcObject
        ?.getTracks()
        .forEach((t) => t.stop());
    };
  }, [studentId]);

  return (
    <div>
      <h3>Student Camera</h3>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", background: "#000" }}
      />
      <div>Status: {status}</div>
    </div>
  );
}
