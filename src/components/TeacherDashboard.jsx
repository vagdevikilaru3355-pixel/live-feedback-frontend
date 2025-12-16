// src/components/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({
    teacherId = "teacher",
    roomId = "DEFAULT",
}) {
    const wsUrl = `${WS_BASE}/ws?role=teacher&client_id=${encodeURIComponent(
        teacherId
    )}&room=${encodeURIComponent(roomId)}`;

    const { status, lastMessage } = useWebSocket(wsUrl);

    const [participants, setParticipants] = useState({});
    const [attention, setAttention] = useState({});

    useEffect(() => {
        if (!lastMessage) return;

        const msg = lastMessage;
        const { type, id } = msg;

        if (type === "participant_joined") {
            setParticipants((p) => ({ ...p, [id]: true }));
        }

        if (type === "participant_left") {
            setParticipants((p) => {
                const c = { ...p };
                delete c[id];
                return c;
            });
            setAttention((a) => {
                const c = { ...a };
                delete c[id];
                return c;
            });
        }

        if (type === "attention_state") {
            setAttention((a) => ({ ...a, [id]: msg.state }));
        }
    }, [lastMessage]);

    return (
        <div style={{ padding: 20 }}>
            <h2>Teacher Dashboard</h2>
            <p>WS Status: {status}</p>

            {Object.keys(participants).length === 0 && (
                <p>No students connected</p>
            )}

            {Object.keys(participants).map((id) => (
                <div key={id}>
                    <b>{id}</b> → {attention[id] || "looking_straight"}
                </div>
            ))}
        </div>
    );
}
