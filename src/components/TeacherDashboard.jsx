import React from "react";
import TeacherCamera from "./TeacherCamera";
import useWebSocket from "../hooks/useWebSocket";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({ name, room }) {
  const { status } = useWebSocket(
    `${WS_BASE}/ws?role=teacher&id=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`
  );

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <h2>Teacher Dashboard</h2>

      <p>WS Status: <b>{status}</b></p>

      {/* 🔥 CAMERA IS FORCED HERE */}
      <TeacherCamera />

      <hr />

      <h3>Participants</h3>
      <p>No students connected</p>

      <h3>Feedback</h3>
      <p>Waiting for feedback…</p>
    </div>
  );
}
