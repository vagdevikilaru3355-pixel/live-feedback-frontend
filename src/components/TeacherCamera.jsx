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
                console.error(err);
                setStatus("camera-error");
            }
        }

        startCamera();
    }, []);

    return (
        <>
            <video ref={videoRef} autoPlay muted playsInline />
            <p>Teacher Camera: {status}</p>
        </>
    );
}
