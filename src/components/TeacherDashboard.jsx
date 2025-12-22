import { useEffect, useState } from "react";
import { WS_BASE } from "../config";

export default function TeacherDashboard({ teacherId, room }) {
    const [participants, setParticipants] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(
            `${WS_BASE}/ws?role=teacher&client_id=${teacherId}&room=${room}`
        );

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "participant_joined") {
                setParticipants((p) => [...new Set([...p, data.id])]);
            }

            if (data.type === "participant_left") {
                setParticipants((p) => p.filter((x) => x !== data.id));
            }

            if (data.type === "attention_feedback") {
                setAlerts((a) => [...a, `${data.id}: ${data.status}`]);
            }
        };

        return () => ws.close();
    }, [teacherId, room]);

    return (
        <div>
            <h3>Participants</h3>
            <ul>{participants.map((p) => <li key={p}>{p}</li>)}</ul>

            <h3>Alerts</h3>
            <ul>{alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
    );
}
