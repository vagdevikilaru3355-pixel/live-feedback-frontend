import React, { useEffect, useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const [on, setOn] = useState(false);
    const streamRef = useRef(null);

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setOn(true);
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
        setOn(false);
    };

    return (
        <div className="panel">
            <h3>Teacher Camera</h3>
            <video ref={videoRef} autoPlay muted playsInline width="320" />
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
