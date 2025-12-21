// src/components/TeacherCamera.jsx
import React, { useEffect, useRef, useState } from "react";

export default function TeacherCamera({ teacherId }) {
    const videoRef = useRef(null);
    const [status, setStatus] = useState("starting");

    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                videoRef.current.srcObject = stream;
                setStatus("running");
            } catch (err) {
                console.error("Teacher camera error", err);
                setStatus("blocked");
            }
        }

        startCamera();
    }, []);

    return (
        <div>
            <h3>Teacher Camera</h3>
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%", borderRadius: "12px", background: "#000" }}
            />
            <p>Status: {status}</p>
        </div>
    );
}
