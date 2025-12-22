import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import StudentCamera from './components/StudentCamera';
import TeacherDashboard from './components/TeacherDashboard';
import './App.css';

// Home/Login Page
function HomePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: 'student',
    roomId: '',
    userId: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.roomId || !formData.userId || !formData.name) {
      alert('Please fill in all fields');
      return;
    }

    // Navigate based on role
    if (formData.role === 'teacher') {
      navigate('/teacher', {
        state: {
          roomId: formData.roomId,
          teacherId: formData.userId,
          teacherName: formData.name
        }
      });
    } else {
      navigate('/student', {
        state: {
          roomId: formData.roomId,
          studentId: formData.userId,
          studentName: formData.name
        }
      });
    }
  };

  const generateRoomId = () => {
    const id = 'ROOM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData({ ...formData, roomId: id });
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <h1>🎓 Live Feedback System</h1>
          <p>Real-time engagement monitoring for online classes</p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>I am a:</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-btn ${formData.role === 'teacher' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'teacher' })}
                >
                  👨‍🏫 Teacher
                </button>
                <button
                  type="button"
                  className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                >
                  👨‍🎓 Student
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                id="userId"
                type="text"
                placeholder="Enter a unique ID"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
              />
              <small>Use a unique identifier (e.g., student001, teacher01)</small>
            </div>

            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>
              <div className="input-with-button">
                <input
                  id="roomId"
                  type="text"
                  placeholder="Enter or generate room ID"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  required
                />
                <button type="button" onClick={generateRoomId} className="generate-btn">
                  Generate
                </button>
              </div>
              <small>
                {formData.role === 'teacher'
                  ? 'Create a new room or use an existing one'
                  : 'Enter the room ID provided by your teacher'
                }
              </small>
            </div>

            <button type="submit" className="submit-btn">
              {formData.role === 'teacher' ? 'Start Teaching Session' : 'Join Class'}
            </button>
          </form>
        </div>

        <div className="info-section">
          <h3>How it works:</h3>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">👨‍🏫</div>
              <h4>For Teachers</h4>
              <p>Create a room, share the Room ID with students, and monitor their engagement in real-time</p>
            </div>
            <div className="info-card">
              <div className="info-icon">👨‍🎓</div>
              <h4>For Students</h4>
              <p>Join using the Room ID, allow camera access, and the system will monitor your engagement</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🤖</div>
              <h4>AI Monitoring</h4>
              <p>MediaPipe AI detects drowsiness, distraction, and looking away to help maintain focus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Teacher Page Wrapper
function TeacherPage() {
  const location = window.location;
  const state = location.state || {};

  // Get WebSocket URL from environment or use default
  const websocketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

  return (
    <TeacherDashboard
      roomId={state.roomId}
      teacherId={state.teacherId}
      teacherName={state.teacherName}
      websocketUrl={websocketUrl}
    />
  );
}

// Student Page Wrapper
function StudentPage() {
  const location = window.location;
  const state = location.state || {};

  // Get WebSocket URL from environment or use default
  const websocketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

  return (
    <StudentCamera
      roomId={state.roomId}
      studentId={state.studentId}
      studentName={state.studentName}
      websocketUrl={websocketUrl}
    />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/student" element={<StudentPage />} />
      </Routes>
    </Router>
  );
}

export default App;