import React, { useEffect, useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                videoRef.current.srcObject = stream;
            } catch (err) {
                setError("Camera permission required");
            }
        }
        startCamera();
    }, []);

    return (
        <div>
            <h3>Teacher Camera</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "320px", borderRadius: 8 }}
            />
        </div>
    );
}
