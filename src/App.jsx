// src/App.jsx
import React, { useState } from "react";
import TeacherCamera from "./components/TeacherCamera";
import StudentCamera from "./components/StudentCamera";
import TeacherDashboard from "./components/TeacherDashboard";

export default function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Live Feedback System</h2>
        <button onClick={() => setRole("teacher")}>Teacher</button>
        <button onClick={() => setRole("student")}>Student</button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {role === "teacher" && (
        <>
          <TeacherCamera teacherId="teacher-1" />
          <TeacherDashboard teacherId="teacher-1" />
        </>
      )}

      {role === "student" && <StudentCamera studentId="student-1" />}
    </div>
  );
}
