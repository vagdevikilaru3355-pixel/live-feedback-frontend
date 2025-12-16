import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

const WS_BASE = "wss://live-feedback-backend.onrender.com";

export default function TeacherDashboard({
    teacherId = "teacher",
    roomId = "DEFAULT",
}) {
    /* ================= WebSocket ================= */
    const wsUrl = `${WS_BASE}/ws?role=teacher&client_id=${encodeURIComponent(
        teacherId
    )}&room=${encodeURIComponent(roomId)}`;

    const { status, lastMessage } = useWebSocket(wsUrl);

    const [participants, setParticipants] = useState({});
    const [attention, setAttention] = useState({});

    /* ================= Teacher Camera ================= */
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [cameraOn, setCameraOn] = useState(false);

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setCameraOn(true);
        } catch (err) {
            alert("Camera permission denied");
        }
    }

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setCameraOn(false);
    }

    /* ================= WebSocket Messages ================= */
    useEffect(() => {
        if (!lastMessage) return;

        const { type, id, state } = lastMessage;

        if (type === "participant_joined") {
            setParticipants((prev) => ({ ...prev, [id]: true }));
        }

        if (type === "participant_left") {
            setParticipants((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            setAttention((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        }

        if (type === "attention_state") {
            setAttention((prev) => ({ ...prev, [id]: state }));
        }
    }, [lastMessage]);

    /* ================= UI ================= */
    return (
        <div style={{ padding: 24, color: "white" }}>
            <h2>Teacher Dashboard</h2>

            <p>
                WebSocket Status:{" "}
                <b style={{ color: status === "OPEN" ? "#22c55e" : "#f97316" }}>
                    {status}
                </b>
            </p>

            {/* ---------- Teacher Camera ---------- */}
            <div style={{ marginTop: 20 }}>
                <h3>Teacher Camera</h3>

                {!cameraOn ? (
                    <button onClick={startCamera}>📷 Camera ON</button>
                ) : (
                    <button onClick={stopCamera}>❌ Camera OFF</button>
                )}

                <div style={{ marginTop: 12 }}>
                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        style={{
                            width: "320px",
                            borderRadius: "12px",
                            background: "black",
                            display: cameraOn ? "block" : "none",
                        }}
                    />
                </div>
            </div>

            {/* ---------- Participants & Feedback ---------- */}
            <div style={{ marginTop: 30 }}>
                <h3>Participants</h3>

                {Object.keys(participants).length === 0 && (
                    <p>No students connected</p>
                )}

                {Object.keys(participants).map((id) => (
                    <div key={id} style={{ marginBottom: 6 }}>
                        <b>{id}</b> →{" "}
                        <span
                            style={{
                                color:
                                    attention[id] === "drowsy"
                                        ? "#ef4444"
                                        : attention[id] === "looking_away"
                                            ? "#facc15"
                                            : "#22c55e",
                            }}
                        >
                            {attention[id] || "looking_straight"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
