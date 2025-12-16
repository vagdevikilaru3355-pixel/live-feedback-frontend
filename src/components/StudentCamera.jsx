import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function StudentCamera({ studentId, roomId }) {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [camStatus, setCamStatus] = useState("starting");

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_BASE}/ws?role=student&client_id=${studentId}&room=${roomId}`
    );
    wsRef.current = ws;
    return () => ws.close();
  }, [studentId, roomId]);

  function send(state) {
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

    function classify(lm) {
      const ear =
        (dist(lm[159], lm[145]) / dist(lm[33], lm[133]) +
          dist(lm[386], lm[374]) / dist(lm[362], lm[263])) /
        2;

      if (ear < 0.18) return "drowsy";
      if (lm[1].x < 0.35 || lm[1].x > 0.65) return "looking_away";
      return "looking_straight";
    }

    async function start() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCamStatus("running");

      faceMesh = new FaceMesh({
        locateFile: (f) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
      });

      faceMesh.onResults((r) => {
        if (!r.multiFaceLandmarks?.length) {
          send("looking_away");
          return;
        }
        send(classify(r.multiFaceLandmarks[0]));
      });

      camera = new Camera(videoRef.current, {
        onFrame: async () =>
          await faceMesh.send({ image: videoRef.current }),
      });

      camera.start();
    }

    start();
    return () => camera?.stop();
  }, []);

  return (
    <div>
      <h3>Student Camera</h3>
      <video ref={videoRef} autoPlay playsInline style={{ width: 260 }} />
      <p>Status: {camStatus}</p>
    </div>
  );
}
