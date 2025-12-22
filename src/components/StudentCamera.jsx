import { useRef, useState } from "react";
import { WS_BASE } from "../config";

export default function StudentCamera({ studentId }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [started, setStarted] = useState(false);

  async function startStudent() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    videoRef.current.srcObject = stream;

    wsRef.current = new WebSocket(
      `${WS_BASE}/ws?role=student&client_id=${studentId}&room=ROOM1`
    );

    setStarted(true);
  }

  return (
    <div>
      <h3>Student Camera</h3>

      {!started && (
        <button onClick={startStudent}>
          Start Student Camera
        </button>
      )}

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", height: 300, background: "#000" }}
      />
    </div>
  );
}
