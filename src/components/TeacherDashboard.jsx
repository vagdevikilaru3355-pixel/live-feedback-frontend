import { useEffect, useState } from "react";
import { WS_BASE } from "../config";

export default function TeacherDashboard() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(
            `${WS_BASE}/ws?role=teacher&client_id=teacher&room=ROOM1`
        );

        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === "attention_feedback") {
                setAlerts((a) => [...a, msg]);
            }
        };

        return () => ws.close();
    }, []);

    return (
        <div>
            <h3>Teacher Dashboard</h3>
            {alerts.map((a, i) => (
                <div key={i}>
                    {a.id}: {a.status}
                </div>
            ))}
        </div>
    );
}
