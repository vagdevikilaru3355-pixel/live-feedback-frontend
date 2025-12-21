import React from "react";
import useWebSocket from "../hooks/useWebSocket";
import TeacherCamera from "./TeacherCamera";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({ name, room }) {
    const wsUrl = `${WS_BASE}/ws?role=teacher&client_id=${name}&room=${room}`;
    const { status, messages } = useWebSocket(wsUrl);

    const participants = {};
    const feedback = {};

    messages.forEach((m) => {
        if (m.type === "participant_joined") participants[m.id] = true;
        if (m.type === "participant_left") delete participants[m.id];
        if (m.type === "attention_state") feedback[m.id] = m.state;
    });

    return (
        <div style={{ padding: 20 }}>
            <h2>Teacher Dashboard</h2>
            <p>WS: {status}</p>

            {/* CAMERA */}
            <TeacherCamera />

            {/* PARTICIPANTS */}
            <h3>Participants</h3>
            {Object.keys(participants).length === 0 && <p>No students</p>}
            <ul>
                {Object.keys(participants).map((id) => (
                    <li key={id}>{id}</li>
                ))}
            </ul>

            {/* FEEDBACK */}
            <h3>Feedback</h3>
            <ul>
                {Object.entries(feedback).map(([id, state]) => (
                    <li key={id}>
                        {id} → {state}
                    </li>
                ))}
            </ul>
        </div>
    );
}
