import React, { useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const [isOn, setIsOn] = useState(false);
    const streamRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            setIsOn(true);
        } catch (err) {
            alert("Camera permission denied or not available");
            console.error(err);
        }
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setIsOn(false);
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>Teacher Camera</h3>

            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                width="320"
                style={{ borderRadius: "8px", background: "#000" }}
            />

            <div style={{ marginTop: "10px" }}>
                {!isOn ? (
                    <button onClick={startCamera}>Camera ON</button>
                ) : (
                    <button onClick={stopCamera}>Camera OFF</button>
                )}
            </div>
        </div>
    );
}
