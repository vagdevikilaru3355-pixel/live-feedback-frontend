import React, { useRef, useState } from "react";

export default function TeacherCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [on, setOn] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setOn(true);
    } catch (err) {
      alert("Camera permission denied");
      console.error(err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    videoRef.current.srcObject = null;
    setOn(false);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Teacher Camera</h3>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="320"
        style={{ background: "#000", borderRadius: 8 }}
      />

      <div style={{ marginTop: 10 }}>
        {!on ? (
          <button onClick={startCamera}>Camera ON</button>
        ) : (
          <button onClick={stopCamera}>Camera OFF</button>
        )}
      </div>
    </div>
  );
}
