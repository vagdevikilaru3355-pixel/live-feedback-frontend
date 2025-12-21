import { useState } from "react";
import TeacherCamera from "./components/TeacherCamera";
import StudentCamera from "./components/StudentCamera";
import TeacherDashboard from "./components/TeacherDashboard";

export default function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Live Feedback System</h2>
        <button onClick={() => setRole("teacher")}>Join as Teacher</button>
        <button onClick={() => setRole("student")}>Join as Student</button>
      </div>
    );
  }

  if (role === "teacher") {
    return (
      <>
        <TeacherCamera />
        <TeacherDashboard />
      </>
    );
  }

  if (role === "student") {
    return <StudentCamera studentId="student-1" />;
  }
}
