import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function StudentCamera({ studentId = "student", roomId = "DEFAULT" }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);

  const [status, setStatus] = useState("looking_straight");

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_BASE}/ws?role=student&client_id=${studentId}&room=${roomId}`
    );
    wsRef.current = ws;

    return () => ws.close();
  }, [studentId, roomId]);

  function sendFeedback(state) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "attention_state",
          id: studentId,
          state,
        })
      );
    }
  }

  useEffect(() => {
    let camera, faceMesh;

    function dist(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function classify(landmarks) {
      const ear =
        (dist(landmarks[159], landmarks[145]) / dist(landmarks[33], landmarks[133]) +
          dist(landmarks[386], landmarks[374]) / dist(landmarks[362], landmarks[263])) / 2;

      if (ear < 0.18) return "drowsy";

      const noseX = landmarks[1].x;
      if (noseX < 0.35 || noseX > 0.65) return "looking_away";

      return "looking_straight";
    }

    async function start() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      faceMesh = new FaceMesh({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
      });

      faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true });

      faceMesh.onResults((res) => {
        if (!res.multiFaceLandmarks?.length) return;
        const s = classify(res.multiFaceLandmarks[0]);
        setStatus(s);
        sendFeedback(s);
      });

      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
      });

      camera.start();
    }

    start();
    return () => camera && camera.stop();
  }, []);

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h2>Student</h2>
      <video ref={videoRef} muted playsInline style={{ width: "90%" }} />
      <p>Status: <b>{status}</b></p>
    </div>
  );
}
