// src/components/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

export default function TeacherDashboard({
    teacherId = "teacher-1",
    roomId = "DEFAULT",
    wsHost = "ws://localhost:8000",
}) {
    const wsUrl = `${wsHost}/ws?role=teacher&client_id=${encodeURIComponent(
        teacherId
    )}&room=${encodeURIComponent(roomId)}`;

    const { status, lastMessage } = useWebSocket(wsUrl);

    // { "HI": { id: "HI", status: "joined" }, ... }
    const [participants, setParticipants] = useState({});
    // { "HI": "looking_straight" | "drowsy" }
    const [attentionByStudent, setAttentionByStudent] = useState({});
    const [lastWsJson, setLastWsJson] = useState(null);

    useEffect(() => {
        if (!lastMessage) return;

        let msg;
        try {
            msg = JSON.parse(lastMessage.data);
        } catch {
            return;
        }

        setLastWsJson(msg);

        const type = msg.type;
        const id = msg.id;

        // ----- Participant join -----
        if (type === "participant_joined" && id) {
            setParticipants((prev) => ({
                ...prev,
                [id]: { id, status: "joined" },
            }));
            return;
        }

        // ----- Participant left -----
        if (type === "participant_left" && id) {
            setParticipants((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            setAttentionByStudent((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            return;
        }

        // ----- Attention state (looking_straight / drowsy) -----
        if (type === "attention_state" && id) {
            const state = msg.state; // "looking_straight" | "drowsy"
            setAttentionByStudent((prev) => ({
                ...prev,
                [id]: state,
            }));

            // ensure this student is in participants list
            setParticipants((prev) => {
                if (prev[id]) return prev;
                return {
                    ...prev,
                    [id]: { id, status: "joined" },
                };
            });
        }
    }, [lastMessage]);

    const wsStatusLabel =
        status === "OPEN" ? "open" : status === "CLOSED" ? "closed" : "connecting";

    const participantList = Object.values(participants);
    const attentionEntries = Object.entries(attentionByStudent);

    return (
        <div className="teacher-dashboard-wrapper">
            <h2 className="teacher-dashboard-title">Teacher Dashboard</h2>

            <div className="ws-status-row">
                <span>WS:</span>{" "}
                <span
                    className={
                        wsStatusLabel === "open" ? "ws-pill ws-open" : "ws-pill ws-closed"
                    }
                >
                    {wsStatusLabel}
                </span>
            </div>

            {/* Participants */}
            <div className="panel">
                <div className="panel-title">Participants</div>
                {participantList.length === 0 ? (
                    <div className="panel-empty">No students connected yet.</div>
                ) : (
                    <ul className="participant-list">
                        {participantList.map((p) => (
                            <li key={p.id} className="participant-item">
                                <span className="participant-name">{p.id}</span>
                                <span className="participant-tag">
                                    {p.status === "joined" ? "joined" : p.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Alerts / Attention */}
            <div className="panel">
                <div className="panel-title">Alerts</div>
                {attentionEntries.length === 0 ? (
                    <div className="panel-empty">
                        No active alerts — all students are looking straight (or no alerts).
                    </div>
                ) : (
                    <ul className="alerts-list">
                        {attentionEntries.map(([id, state]) => (
                            <li key={id} className="alert-item">
                                <span className="alert-name">{id}</span>
                                <span
                                    className={
                                        state === "drowsy" ? "alert-tag alert-bad" : "alert-tag"
                                    }
                                >
                                    {state === "drowsy"
                                        ? "drowsy / eyes closed"
                                        : "looking straight"}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Optional debug panel */}
            {lastWsJson && (
                <div className="panel debug-panel">
                    <div className="panel-title">Last WS message (debug)</div>
                    <pre className="debug-json">
                        {JSON.stringify(lastWsJson, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
