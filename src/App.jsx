import TeacherDashboard from "./components/TeacherDashboard";
import StudentCamera from "./components/StudentCamera";

export default function App() {
  const name = "K.Vagdevi";
  const room = "DEMO123";

  return (
    <>
      {/* OPEN IN ONE TAB */}
      <TeacherDashboard teacherId={name} roomId={room} />

      {/* OPEN IN ANOTHER TAB / MOBILE */}
      {/* <StudentCamera studentId={name + "_student"} roomId={room} /> */}
    </>
  );
}
