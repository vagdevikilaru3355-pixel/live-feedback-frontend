// src/components/StudentCamera.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function StudentCamera({
  studentId = "student",
  roomId = "DEFAULT",
}) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);

  const [wsStatus, setWsStatus] = useState("connecting");
  const [camStatus, setCamStatus] = useState("starting");
  const [currentStatus, setCurrentStatus] = useState("looking_straight");

  const lastStatusRef = useRef("looking_straight");
  const lastSentAtRef = useRef(0);

  // ---------------- WebSocket ----------------
  useEffect(() => {
    const url = `${WS_BASE}/ws?role=student&client_id=${encodeURIComponent(
      studentId
    )}&room=${encodeURIComponent(roomId)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("open");
    ws.onclose = () => setWsStatus("closed");
    ws.onerror = () => setWsStatus("error");

    return () => ws.close();
  }, [studentId, roomId]);

  function sendFeedback(status) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const now = performance.now();
    if (status === lastStatusRef.current && now - lastSentAtRef.current < 1000)
      return;

    lastStatusRef.current = status;
    lastSentAtRef.current = now;

    ws.send(
      JSON.stringify({
        type: "feedback",
        feedback: status,
      })
    );
  }

  // ---------------- FaceMesh + Camera ----------------
  useEffect(() => {
    let camera;
    let faceMesh;

    function dist(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

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
          locateFile: (f) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
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
      } catch {
        setCamStatus("error");
      }
    }

    start();

    return () => {
      if (camera) camera.stop();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h2>Student View</h2>
      <video ref={videoRef} muted playsInline style={{ width: "80%" }} />
      <p>
        Status: <b>{currentStatus}</b>
      </p>
      <p>
        WS: {wsStatus} | Camera: {camStatus}
      </p>
    </div>
  );
}
