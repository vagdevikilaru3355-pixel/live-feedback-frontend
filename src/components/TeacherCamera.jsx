import { useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const [status, setStatus] = useState("idle");

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
            setStatus("camera-error");
        }
    }

    return (
        <div>
            <h3>Teacher Camera</h3>

            {status !== "camera-on" && (
                <button onClick={startCamera}>
                    Start Camera
                </button>
            )}

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
                    marginTop: "10px",
                }}
            />

            <p>Status: {status}</p>
        </div>
    );
}
