import React, { useEffect, useRef, useState } from "react";

export default function TeacherCamera() {
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
        console.error("Teacher camera error:", err);
        setStatus("permission-denied");
      }
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div>
      <h3>Teacher Camera</h3>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          borderRadius: "12px",
          background: "#000",
        }}
      />
      <div>Status: {status}</div>
    </div>
  );
}
