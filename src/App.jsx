import React, { useState } from "react";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentCamera from "./components/StudentCamera";

export default function App() {
  const [role, setRole] = useState("teacher");
  const roomId = "DEFAULT";

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setRole("teacher")}>Teacher</button>
      <button onClick={() => setRole("student")}>Student</button>

      {role === "teacher" ? (
        <TeacherDashboard teacherId="teacher-1" roomId={roomId} />
      ) : (
        <StudentCamera studentId="student-1" roomId={roomId} />
      )}
    </div>
  );
}
