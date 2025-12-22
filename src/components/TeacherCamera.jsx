import { useEffect, useRef, useState } from "react";

export default function TeacherCamera() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("starting");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStatus("camera-on");
      })
      .catch(() => setStatus("camera-error"));
  }, []);

  return (
    <div>
      <h3>Teacher Camera</h3>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {status}</p>
    </div>
  );
}
