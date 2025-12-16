// src/App.jsx
import React, { useState } from "react";
import StudentCamera from "./components/StudentCamera";
import TeacherDashboard from "./components/TeacherDashboard";
import "./index.css";

// Backend WebSocket host (localhost for now)
const WS_HOST = "ws://localhost:8000";

function generateMeetingCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function App() {
  const [step, setStep] = useState("landing"); // "landing" | "meeting"
  const [role, setRole] = useState("student"); // "student" | "teacher"
  const [name, setName] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const [activeRoom, setActiveRoom] = useState("");

  const handleCreateMeeting = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    const code = generateMeetingCode();
    setActiveRoom(code);
    setMeetingCode(code);
    setStep("meeting");
  };

  const handleJoinMeeting = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!meetingCode.trim()) {
      alert("Please enter meeting code");
      return;
    }
    const code = meetingCode.trim().toUpperCase();
    setActiveRoom(code);
    setStep("meeting");
  };

  // ---------- Landing page ----------
  if (step === "landing") {
    return (
      <div className="landing-root">
        <div className="landing-card">
          <h1 className="app-title">Live Feedback System</h1>
          <p className="app-subtitle">
            Real-time attention alerts for online classes
          </p>

          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={name}
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <div className="role-toggle">
              <button
                className={role === "student" ? "role-btn active" : "role-btn"}
                onClick={() => setRole("student")}
              >
                Student
              </button>
              <button
                className={role === "teacher" ? "role-btn active" : "role-btn"}
                onClick={() => setRole("teacher")}
              >
                Teacher
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Meeting Code</label>
            <input
              type="text"
              value={meetingCode}
              placeholder="Enter or generate meeting code"
              onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="button-row">
            <button className="primary-btn" onClick={handleJoinMeeting}>
              Join Meeting
            </button>
            <button className="secondary-btn" onClick={handleCreateMeeting}>
              Create New Meeting
            </button>
          </div>

          <p className="hint-text">
            Teachers click "Create New Meeting" and share the code with
            students. Students choose "Join Meeting" and enter the code.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Student view ----------
  if (role === "student") {
    return (
      <div className="meeting-root">
        <header className="meeting-header">
          <div>
            <div className="meeting-title">Student View</div>
            <div className="meeting-sub">
              Logged in as <strong>{name}</strong>
            </div>
          </div>
          <div className="meeting-right">
            Code:{" "}
            <span className="meeting-code">
              {activeRoom || meetingCode || "—"}
            </span>
            <button
              className="small-btn"
              onClick={() => {
                setStep("landing");
                setActiveRoom("");
              }}
            >
              Leave
            </button>
          </div>
        </header>

        <main className="meeting-main">
          <StudentCamera
            studentId={name || "student"}
            roomId={activeRoom}
            wsHost={WS_HOST}
          />
        </main>
      </div>
    );
  }

  // ---------- Teacher view ----------
  return (
    <div className="meeting-root">
      <header className="meeting-header">
        <div>
          <div className="meeting-title">Teacher View</div>
          <div className="meeting-sub">
            Logged in as <strong>{name}</strong>
          </div>
        </div>
        <div className="meeting-right">
          Code: <span className="meeting-code">{activeRoom}</span>
          <button
            className="small-btn"
            onClick={() => {
              setStep("landing");
              setActiveRoom("");
            }}
          >
            End
          </button>
        </div>
      </header>

      <main className="meeting-main">
        <TeacherDashboard
          teacherId={name || "teacher"}
          roomId={activeRoom}
          wsHost={WS_HOST}
        />
      </main>
    </div>
  );
}
