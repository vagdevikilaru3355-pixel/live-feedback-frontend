import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import TeacherCamera from "./TeacherCamera";

// 🔴 IMPORTANT: your deployed backend
const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({
    teacherId = "teacher",
    roomId = "DEFAULT",
}) {
    const wsUrl = `${WS_BASE}/ws?role=teacher&client_id=${encodeURIComponent(
        teacherId
    )}&room=${encodeURIComponent(roomId)}`;

    const { status, lastMessage } = useWebSocket(wsUrl);

    // participants: { id: true }
    const [participants, setParticipants] = useState({});
    // attention: { id: "looking_straight" | "drowsy" }
    const [attention, setAttention] = useState({});
    const [lastWsJson, setLastWsJson] = useState(null);

    // 🔁 Handle WS messages
    useEffect(() => {
        if (!lastMessage) return;

        let msg;
        try {
            msg =
                typeof lastMessage === "string"
                    ? JSON.parse(lastMessage)
                    : lastMessage;
        } catch {
            return;
        }

        setLastWsJson(msg);

        const { type, id } = msg;

        // 🟢 Student joined
        if (type === "participant_joined" && id) {
            setParticipants((p) => ({ ...p, [id]: true }));
            return;
        }

        // 🔴 Student left
        if (type === "participant_left" && id) {
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
            return;
        }

        // 👀 Attention updates
        if (type === "attention_state" && id) {
            setAttention((a) => ({ ...a, [id]: msg.state || "looking_straight" }));
            setParticipants((p) => ({ ...p, [id]: true }));
        }
    }, [lastMessage]);

    const participantIds = Object.keys(participants);
    const wsLabel =
        status === "OPEN" ? "OPEN" : status === "CLOSED" ? "CLOSED" : "CONNECTING";

    return (
        <div className="teacher-dashboard-wrapper">
            <h2 className="teacher-dashboard-title">Teacher Dashboard</h2>

            {/* ✅ Teacher Camera */}
            <TeacherCamera />

            {/* 🔌 WebSocket Status */}
            <div className="ws-status-row">
                <strong>WS Status:</strong>{" "}
                <span
                    className={
                        wsLabel === "OPEN" ? "ws-pill ws-open" : "ws-pill ws-closed"
                    }
                >
                    {wsLabel}
                </span>
            </div>

            {/* 👥 Participants */}
            <div className="panel">
                <div className="panel-title">Participants</div>

                {participantIds.length === 0 ? (
                    <p className="panel-empty">No students connected</p>
                ) : (
                    <ul className="participant-list">
                        {participantIds.map((id) => (
                            <li key={id} className="participant-item">
                                <span className="participant-name">{id}</span>
                                <span className="participant-tag">joined</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 🚨 Live Feedback */}
            <div className="panel">
                <div className="panel-title">Live Feedback</div>

                {Object.keys(attention).length === 0 ? (
                    <p className="panel-empty">
                        No feedback yet (waiting for student data)
                    </p>
                ) : (
                    <ul className="alerts-list">
                        {Object.entries(attention).map(([id, state]) => (
                            <li key={id} className="alert-item">
                                <span className="alert-name">{id}</span>
                                <span
                                    className={
                                        state === "drowsy"
                                            ? "alert-tag alert-bad"
                                            : "alert-tag alert-good"
                                    }
                                >
                                    {state}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 🛠 Debug (optional, keep for testing) */}
            {lastWsJson && (
                <div className="panel debug-panel">
                    <div className="panel-title">Last WS Message</div>
                    <pre className="debug-json">
                        {JSON.stringify(lastWsJson, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
