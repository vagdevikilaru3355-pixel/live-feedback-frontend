// src/components/StudentCard.jsx
import React from "react";

export default function StudentCard({ id, info }) {
    const { ts, payload } = info || {};
    return (
        <div style={{
            border: "1px solid #ddd",
            padding: 8,
            borderRadius: 8,
            width: 220,
            background: "white"
        }}>
            <div style={{ fontWeight: 600 }}>{id}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{ts ? new Date(ts).toLocaleTimeString() : ""}</div>
            <div style={{ marginTop: 8 }}>
                <div><strong>faceDetected:</strong> {String(payload?.faceDetected)}</div>
                <div><strong>leftEyeOpen:</strong> {String(payload?.leftEyeOpen)}</div>
                <div><strong>rightEyeOpen:</strong> {String(payload?.rightEyeOpen)}</div>
                <div><strong>mouthOpen:</strong> {String(payload?.mouthOpen)}</div>
            </div>
        </div>
    );
}
