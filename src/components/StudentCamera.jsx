import { useEffect, useRef } from "react";

export default function StudentCamera({ studentId }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => videoRef.current.srcObject = stream);

    wsRef.current = new WebSocket(
      `wss://YOUR-BACKEND.onrender.com/ws?role=student&client_id=${studentId}`
    );

    const interval = setInterval(() => {
      wsRef.current.send({
        type: "feedback",
        status: "looking_straight"
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <video ref={videoRef} autoPlay muted />;
}
