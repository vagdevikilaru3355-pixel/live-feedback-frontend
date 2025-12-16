import React, { useEffect, useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [error, setError] = useState("");

    async function startCamera() {
        try {
            setError("");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setCameraOn(true);
        } catch (err) {
            console.error(err);
            setError("Camera permission denied or not available");
        }
    }

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraOn(false);
    }

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    return (
        <div
            style={{
                background: "#050b18",
                padding: "16px",
                borderRadius: "16px",
                width: "360px",
            }}
        >
            <h3 style={{ color: "white", marginBottom: "10px" }}>
                Teacher Camera
            </h3>

            {!cameraOn ? (
                <button onClick={startCamera}>📷 Camera ON</button>
            ) : (
                <button onClick={stopCamera}>❌ Camera OFF</button>
            )}

            {error && (
                <p style={{ color: "#ef4444", marginTop: "8px", fontSize: "13px" }}>
                    {error}
                </p>
            )}

            <video
                ref={videoRef}
                muted
                playsInline
                style={{
                    marginTop: "12px",
                    width: "100%",
                    borderRadius: "12px",
                    background: "black",
                    display: cameraOn ? "block" : "none",
                }}
            />
        </div>
    );
}
