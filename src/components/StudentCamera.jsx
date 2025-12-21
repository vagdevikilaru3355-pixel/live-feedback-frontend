import { useEffect, useRef, useState } from "react";

export default function StudentCamera({ studentId }) {
  const videoRef = useRef(null);
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
      } catch (err) {
        console.error("Camera error:", err);

        if (err.name === "NotAllowedError") {
          setStatus("permission-denied");
        } else {
          setStatus("camera-error");
        }
      }
    }

    startCamera();
  }, []);

  return (
    <div>
      <h3>Student Camera ({studentId})</h3>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          height: 300,
          background: "black",
          borderRadius: 12,
        }}
      />

      <p>Status: {status}</p>
    </div>
  );
}
