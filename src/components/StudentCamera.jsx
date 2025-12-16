import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function StudentCamera({ studentId, roomId }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);

  const [wsStatus, setWsStatus] = useState("connecting");
  const [camStatus, setCamStatus] = useState("starting");
  const [currentStatus, setCurrentStatus] = useState("looking_straight");

  const lastSentRef = useRef("");

  /* ---------------- WebSocket ---------------- */
  useEffect(() => {
    const ws = new WebSocket(
      `${WS_BASE}/ws?role=student&client_id=${studentId}&room=${roomId}`
    );
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("open");
    ws.onclose = () => setWsStatus("closed");
    ws.onerror = () => setWsStatus("error");

    return () => ws.close();
  }, [studentId, roomId]);

  function sendFeedback(status) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (lastSentRef.current === status) return;

    lastSentRef.current = status;
    wsRef.current.send(
      JSON.stringify({
        type: "feedback",
        feedback: status,
      })
    );
  }

  /* ---------------- FaceMesh ---------------- */
  useEffect(() => {
    let camera;
    let faceMesh;

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    function classify(landmarks) {
      const ear =
        (dist(landmarks[159], landmarks[145]) /
          dist(landmarks[33], landmarks[133]) +
          dist(landmarks[386], landmarks[374]) /
          dist(landmarks[362], landmarks[263])) /
        2;

      if (ear < 0.18) return "drowsy";

      const noseX = landmarks[1].x;
      if (noseX < 0.35 || noseX > 0.65) return "looking_away";

      return "looking_straight";
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCamStatus("running");

        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
        });

        faceMesh.onResults((res) => {
          if (!res.multiFaceLandmarks?.length) {
            setCurrentStatus("looking_away");
            sendFeedback("looking_away");
            return;
          }

          const status = classify(res.multiFaceLandmarks[0]);
          setCurrentStatus(status);
          sendFeedback(status);
        });

        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });

        camera.start();
      } catch (err) {
        console.error(err);
        setCamStatus("error");
      }
    }

    start();
    return () => camera && camera.stop();
  }, []);

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <video ref={videoRef} muted playsInline width="90%" />
      <p>Status: <b>{currentStatus}</b></p>
      <p>WS: {wsStatus} | Camera: {camStatus}</p>
    </div>
  );
}
