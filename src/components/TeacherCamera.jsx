import React, { useEffect, useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [cameraOn, setCameraOn] = useState(false);
    const [error, setError] = useState("");

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            setCameraOn(true);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Camera permission denied or not available");
        }
    }

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setCameraOn(false);
    }

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="panel">
            <div className="panel-title">Teacher Camera</div>

            {!cameraOn ? (
                <button className="btn-primary" onClick={startCamera}>
                    🎥 Turn Camera ON
                </button>
            ) : (
                <button className="btn-danger" onClick={stopCamera}>
                    ⛔ Turn Camera OFF
                </button>
            )}

            {error && <div className="error-text">{error}</div>}

            <div className="camera-box">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: "100%",
                        maxWidth: "420px",
                        borderRadius: "12px",
                        marginTop: "12px",
                        display: cameraOn ? "block" : "none",
                    }}
                />
            </div>
        </div>
    );
}
