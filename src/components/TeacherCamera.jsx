import React, { useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [on, setOn] = useState(false);

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setOn(true);
        } catch {
            alert("Camera permission denied");
        }
    }

    function stopCamera() {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
        setOn(false);
    }

    return (
        <div style={{ marginBottom: 20 }}>
            <h3>Teacher Camera</h3>

            {!on ? (
                <button onClick={startCamera}>Camera ON</button>
            ) : (
                <button onClick={stopCamera}>Camera OFF</button>
            )}

            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                    width: 300,
                    marginTop: 10,
                    borderRadius: 8,
                    display: on ? "block" : "none",
                }}
            />
        </div>
    );
}
