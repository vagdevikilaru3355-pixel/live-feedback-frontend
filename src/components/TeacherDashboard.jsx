import React, { useEffect, useState } from "react";

export default function TeacherDashboard() {
    const [alerts, setAlerts] = useState({});
    const [wsStatus, setWsStatus] = useState("connecting");

    useEffect(() => {
        const ws = new WebSocket(
            "wss://live-feedback-backend.onrender.com/ws?role=teacher&client_id=teacher"
        );

        ws.onopen = () => setWsStatus("open");
        ws.onclose = () => setWsStatus("closed");

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "alert") {
                setAlerts((prev) => ({
                    ...prev,
                    [data.id]: data.alert,
                }));
            }

            if (data.type === "alert_cleared") {
                setAlerts((prev) => {
                    const copy = { ...prev };
                    delete copy[data.id];
                    return copy;
                });
            }
        };

        return () => ws.close();
    }, []);

    return (
        <div>
            <h3>Teacher Dashboard</h3>
            <div>WS Status: {wsStatus}</div>

            {Object.keys(alerts).length === 0 && (
                <p>No alerts</p>
            )}

            {Object.entries(alerts).map(([id, a]) => (
                <div key={id}>
                    {id} → {a.label}
                </div>
            ))}
        </div>
    );
}
