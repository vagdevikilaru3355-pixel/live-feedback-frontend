import { useEffect, useState } from "react";
import { WS_BASE } from "../config";

export default function TeacherDashboard() {
    const [wsStatus, setWsStatus] = useState("CONNECTING");
    const [participants, setParticipants] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(
            `${WS_BASE}/ws?role=teacher&client_id=teacher-1&room=ROOM1`
        );

        ws.onopen = () => {
            setWsStatus("OPEN");
        };

        ws.onclose = () => {
            setWsStatus("CLOSED");
        };

        ws.onerror = () => {
            setWsStatus("ERROR");
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            // Student joined
            if (msg.type === "participant_joined") {
                setParticipants((prev) =>
                    prev.includes(msg.id) ? prev : [...prev, msg.id]
                );
            }

            // Student left
            if (msg.type === "participant_left") {
                setParticipants((prev) => prev.filter((p) => p !== msg.id));
            }

            // Attention / alert message
            if (msg.type === "attention_feedback" || msg.type === "alert") {
                setAlerts((prev) => [
                    {
                        id: msg.id,
                        status: msg.status || msg.alert?.label,
                        ts: Date.now(),
                    },
                    ...prev,
                ]);
            }

            // Snapshot when teacher connects
            if (msg.type === "participants_snapshot") {
                setParticipants(msg.ids || []);
            }
        };

        return () => ws.close();
    }, []);

    return (
        <div
            style={{
                padding: 16,
                background: "#0b1020",
                color: "white",
                borderRadius: 12,
            }}
        >
            <h3>Teacher Dashboard</h3>

            <p>
                WebSocket Status:{" "}
                <strong style={{ color: wsStatus === "OPEN" ? "#4ade80" : "#facc15" }}>
                    {wsStatus}
                </strong>
            </p>

            <hr />

            <h4>Participants</h4>
            {participants.length === 0 ? (
                <p>No students connected</p>
            ) : (
                <ul>
                    {participants.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
            )}

            <hr />

            <h4>Alerts</h4>
            {alerts.length === 0 ? (
                <p>No alerts</p>
            ) : (
                alerts.map((a, i) => (
                    <div
                        key={i}
                        style={{
                            padding: 8,
                            marginBottom: 6,
                            background: "#111827",
                            borderRadius: 8,
                        }}
                    >
                        <strong>{a.id}</strong> → {a.status}
                    </div>
                ))
            )}
        </div>
    );
}
