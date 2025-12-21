import { useEffect, useState } from "react";
import TeacherCamera from "./TeacherCamera";

export default function TeacherDashboard() {
    const [wsStatus, setWsStatus] = useState("connecting");

    useEffect(() => {
        const ws = new WebSocket(
            "ws://127.0.0.1:8000/ws?role=teacher&client_id=teacher-1"
        );

        ws.onopen = () => setWsStatus("OPEN");
        ws.onclose = () => setWsStatus("CLOSED");

        return () => ws.close();
    }, []);

    return (
        <>
            <TeacherCamera />
            <h3>Teacher Dashboard</h3>
            <p>WS Status: {wsStatus}</p>
            <p>No students connected (yet)</p>
        </>
    );
}
