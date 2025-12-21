import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import TeacherCamera from "./TeacherCamera";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({ name, room }) {
    const { status, lastMessage } = useWebSocket(
        `${WS_BASE}/ws?role=teacher&id=${name}&room=${room}`
    );

    const [participants, setParticipants] = useState({});
    const [feedback, setFeedback] = useState({});

    useEffect(() => {
        if (!lastMessage) return;

        const { type, id, state } = lastMessage;

        if (type === "join") {
            setParticipants(p => ({ ...p, [id]: true }));
        }

        if (type === "leave") {
            setParticipants(p => {
                const c = { ...p };
                delete c[id];
                return c;
            });
        }

        if (type === "attention") {
            setFeedback(f => ({ ...f, [id]: state }));
        }
    }, [lastMessage]);

    return (
        <div>
            <h2>Teacher Dashboard</h2>
            <p>WS Status: {status}</p>

            <TeacherCamera />

            <div className="panel">
                <h3>Participants</h3>
                {Object.keys(participants).length === 0 && <p>No students</p>}
                {Object.keys(participants).map(id => (
                    <div key={id}>
                        {id} → {feedback[id] || "looking_straight"}
                    </div>
                ))}
            </div>
        </div>
    );
}
