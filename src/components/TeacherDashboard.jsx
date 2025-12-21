// src/components/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";

const WS_HOST = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({ teacherId }) {
    const [participants, setParticipants] = useState({});
    const [alerts, setAlerts] = useState({});

    useEffect(() => {
        const ws = new WebSocket(
            `${WS_HOST}/ws?role=teacher&client_id=${teacherId}`
        );

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "alert") {
                setAlerts((prev) => ({
                    ...prev,
                    [data.id]: data.alert.label,
                }));

                setParticipants((prev) => ({
                    ...prev,
                    [data.id]: true,
                }));
            }

            if (data.type === "alert_cleared") {
                setAlerts((prev) => {
                    const c = { ...prev };
                    delete c[data.id];
                    return c;
                });
            }
        };
    }, [teacherId]);

    return (
        <div>
            <h3>Participants</h3>
            {Object.keys(participants).length === 0 && <p>No students</p>}
            <ul>
                {Object.keys(participants).map((id) => (
                    <li key={id}>{id}</li>
                ))}
            </ul>

            <h3>Alerts</h3>
            {Object.keys(alerts).length === 0 && <p>No alerts</p>}
            <ul>
                {Object.entries(alerts).map(([id, alert]) => (
                    <li key={id}>
                        ⚠ {id}: {alert}
                    </li>
                ))}
            </ul>
        </div>
    );
}
