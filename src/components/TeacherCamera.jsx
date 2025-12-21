import { useEffect, useRef, useState } from "react";

export default function TeacherCamera() {
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
                setStatus("camera-on");
            } catch (err) {
                console.error("Teacher camera error:", err);

                if (err && err.name === "NotAllowedError") {
                    setStatus("permission-denied");
                } else if (err && err.name === "NotFoundError") {
                    setStatus("no-camera");
                } else {
                    setStatus("camera-error");
                }
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
                style={{
                    width: "100%",
                    height: "300px",
                    background: "black",
                    borderRadius: "12px",
                }}
            />
            <p>Status: {status}</p>

            {status === "permission-denied" && (
                <p style={{ color: "red" }}>
                    Camera access denied. Allow camera in browser settings.
                </p>
            )}
        </div>
    );
}
