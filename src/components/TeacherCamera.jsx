import { useEffect, useRef } from "react";

export default function TeacherCamera() {
    const videoRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => videoRef.current.srcObject = stream)
            .catch(console.error);
    }, []);

    return (
        <div>
            <h3>Teacher Camera</h3>
            <video ref={videoRef} autoPlay muted playsInline />
        </div>
    );
}
