import { useRef, useState } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);
    const [started, setStarted] = useState(false);

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            setStarted(true);
        } catch {
            alert("Allow camera access");
        }
    }

    return (
        <div>
            <h3>Teacher</h3>

            {!started && (
                <button onClick={startCamera}>Start Camera</button>
            )}

            <video ref={videoRef} autoPlay muted playsInline />
        </div>
    );
}
