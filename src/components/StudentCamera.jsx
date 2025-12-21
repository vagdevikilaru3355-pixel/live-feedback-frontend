import React, { useEffect, useRef } from "react";

export default function StudentCamera({ onFrame }) {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      });
  }, []);

  return (
    <div className="panel">
      <h3>Student Camera</h3>
      <video ref={videoRef} autoPlay playsInline width="260" />
    </div>
  );
}
