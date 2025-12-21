import React from "react";
import TeacherCamera from "./TeacherCamera";
import useWebSocket from "../hooks/useWebSocket";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({ name, room }) {
    const { status, lastMessage } = useWebSocket(
        `${WS_BASE}/ws?role=teacher&id=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`
    );

    return (
        <div style={{ padding: "20px", color: "white" }}>
            <h2>Teacher Dashboard</h2>

            <p>
                WS Status: <b>{status}</b>
            </p>

            {/* 🔴 THIS WAS MISSING BEFORE */}
            <TeacherCamera />

            <hr />

            <h3>Participants</h3>
            <p>(Will appear when students join)</p>

            <h3>Feedback</h3>
            <p>(Live attention feedback will appear here)</p>
        </div>
    );
}
