import { useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const [started, setStarted] = useState(false);
    const [error, setError] = useState("");

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            videoRef.current.srcObject = stream;
            setStarted(true);
        } catch (e) {
            setError("Camera permission denied");
        }
    }

    return (
        <div>
            <h3>Teacher Camera</h3>

            {!started && (
                <button onClick={startCamera}>
                    Start Teacher Camera
                </button>
            )}

            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%", height: 300, background: "#000" }}
            />

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
