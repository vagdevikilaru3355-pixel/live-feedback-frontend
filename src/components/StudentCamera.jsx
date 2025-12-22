import { useEffect, useRef, useState } from "react";
import { WS_BASE } from "../config";

export default function StudentCamera({ studentId, room }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState("starting");

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setStatus("camera-on");

        const ws = new WebSocket(
          `${WS_BASE}/ws?role=student&client_id=${studentId}&room=${room}`
        );
        wsRef.current = ws;

        ws.onopen = () => console.log("Student WS connected");

        setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "feedback",
                feedback: "looking-straight",
              })
            );
          }
        }, 3000);
      } catch (err) {
        console.error(err);
        setStatus("camera-error");
      }
    }

    start();
    return () => wsRef.current?.close();
  }, [studentId, room]);

  return (
    <div>
      <h3>Student Camera</h3>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {status}</p>
    </div>
  );
}
