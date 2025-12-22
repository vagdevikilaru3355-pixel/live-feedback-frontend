import { useRef, useState } from "react";
import { WS_BASE } from "../config";

export default function StudentCamera({ studentId, room }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [started, setStarted] = useState(false);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      const ws = new WebSocket(
        `${WS_BASE}/ws?role=student&client_id=${studentId}&room=${room}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setInterval(() => {
          ws.send(
            JSON.stringify({
              type: "feedback",
              feedback: "looking-straight",
            })
          );
        }, 3000);
      };

      setStarted(true);
    } catch (err) {
      alert("Please allow camera access");
    }
  }

  return (
    <div>
      <h3>Student</h3>

      {!started && (
        <button onClick={startCamera}>Start Camera</button>
      )}

      <video ref={videoRef} autoPlay muted playsInline />
    </div>
  );
}
