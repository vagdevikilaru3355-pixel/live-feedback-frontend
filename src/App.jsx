import TeacherDashboard from "./components/TeacherDashboard";
import StudentCamera from "./components/StudentCamera";

export default function App() {
  const ROOM_ID = "YZRRWQ"; // MUST MATCH FOR TEACHER & STUDENTS

  return (
    <div>
      <TeacherDashboard teacherId="K.Vagdevi" roomId={ROOM_ID} />
      <hr />
      <StudentCamera studentId="Student-1" roomId={ROOM_ID} />
    </div>
  );
}
