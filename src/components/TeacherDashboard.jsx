import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import TeacherCamera from "./TeacherCamera";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({ teacherId, roomId }) {
    const { status, lastMessage } = useWebSocket(
        `${WS_BASE}/ws?role=teacher&client_id=${teacherId}&room=${roomId}`
    );

    const [participants, setParticipants] = useState({});
    const [feedback, setFeedback] = useState({});

    useEffect(() => {
        if (!lastMessage) return;

        const { type, id, state } = lastMessage;

        if (type === "participant_joined") {
            setParticipants((p) => ({ ...p, [id]: true }));
        }

        if (type === "participant_left") {
            setParticipants((p) => {
                const c = { ...p };
                delete c[id];
                return c;
            });
        }

        if (type === "attention_state") {
            setFeedback((f) => ({ ...f, [id]: state }));
        }
    }, [lastMessage]);

    return (
        <div>
            <h2>Teacher Dashboard</h2>
            <p>WS Status: {status}</p>

            <TeacherCamera />

            <h3>Participants</h3>
            {Object.keys(participants).length === 0 && <p>No students connected</p>}
            {Object.keys(participants).map((id) => (
                <p key={id}>
                    {id} → {feedback[id] || "looking_straight"}
                </p>
            ))}
        </div>
    );
}
