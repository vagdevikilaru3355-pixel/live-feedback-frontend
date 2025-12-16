// src/components/FeedbackList.jsx
import React from "react";

export default function FeedbackList({ events = [] }) {
    return (
        <div>
            {events.map((e, i) => (
                <div key={i} style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <div style={{ fontSize: 12 }}>{e.id} • {new Date(e.ts).toLocaleTimeString()}</div>
                    <pre style={{ margin: 0 }}>{JSON.stringify(e.payload, null, 2)}</pre>
                </div>
            ))}
        </div>
    );
}
