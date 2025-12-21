import React, { useRef, useState, useEffect } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [on, setOn] = useState(false);

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setOn(true);
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setOn(false);
    };

    useEffect(() => () => stopCamera(), []);

    return (
        <div>
            <h3>Teacher Camera</h3>
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: 360, height: 260, background: "black" }}
            />
            <div>
                {!on ? (
                    <button onClick={startCamera}>Camera ON</button>
                ) : (
                    <button onClick={stopCamera}>Camera OFF</button>
                )}
            </div>
        </div>
    );
}
