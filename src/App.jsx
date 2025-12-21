import React, { useState } from "react";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentCamera from "./components/StudentCamera";

export default function App() {
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  if (!role) {
    return (
      <div>
        <h2>Live Feedback System</h2>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Room" onChange={(e) => setRoom(e.target.value)} />
        <button onClick={() => setRole("teacher")}>Teacher</button>
        <button onClick={() => setRole("student")}>Student</button>
      </div>
    );
  }

  return role === "teacher" ? (
    <TeacherDashboard name={name} room={room} />
  ) : (
    <StudentCamera name={name} room={room} />
  );
}
