import { useEffect, useState } from "react";

export default function TeacherDashboard() {
    const [students, setStudents] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(
            "wss://YOUR-BACKEND.onrender.com/ws?role=teacher&client_id=teacher"
        );

        ws.onmessage = e => {
            const data = JSON.parse(e.data);

            if (data.type === "participants_snapshot") {
                setStudents(data.students);
            }

            if (data.type === "attention_feedback") {
                setAlerts(a => [...a, data]);
            }
        };
    }, []);

    return (
        <div>
            <h3>Participants</h3>
            {students.map(s => <div key={s}>{s}</div>)}

            <h3>Alerts</h3>
            {alerts.map((a, i) =>
                <div key={i}>{a.id} → {a.status}</div>
            )}
        </div>
    );
}
