import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import TeacherCamera from "./TeacherCamera";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({ teacherId, roomId }) {
    const { status, lastMessage } = useWebSocket(
        `${WS_BASE}/ws?role=teacher&client_id=${teacherId}&room=${roomId}`
    );

    const [participants, setParticipants] = useState({});
    const [attention, setAttention] = useState({});

    useEffect(() => {
        if (!lastMessage) return;

        const msg = JSON.parse(lastMessage.data);

        if (msg.type === "participant_joined") {
            setParticipants((p) => ({ ...p, [msg.id]: true }));
        }

        if (msg.type === "participant_left") {
            setParticipants((p) => {
                const c = { ...p };
                delete c[msg.id];
                return c;
            });
            setAttention((a) => {
                const c = { ...a };
                delete c[msg.id];
                return c;
            });
        }

        if (msg.type === "attention_state") {
            setParticipants((p) => ({ ...p, [msg.id]: true }));
            setAttention((a) => ({ ...a, [msg.id]: msg.state }));
        }
    }, [lastMessage]);

    return (
        <div style={{ padding: 20 }}>
            <h2>Teacher Dashboard</h2>
            <p>WS Status: {status}</p>

            <TeacherCamera />

            <h3>Participants & Feedback</h3>

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
