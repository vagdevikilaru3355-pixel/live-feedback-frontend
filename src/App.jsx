import TeacherCamera from "./components/TeacherCamera";
import StudentCamera from "./components/StudentCamera";
import TeacherDashboard from "./components/TeacherDashboard";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Live Feedback System</h2>

      <TeacherCamera />
      <hr />

      <TeacherDashboard />
      <hr />

      <StudentCamera studentId="student-1" />
    </div>
  );
}
