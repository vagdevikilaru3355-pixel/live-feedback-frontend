import StudentCamera from "./StudentCamera";

export default function TeacherCamera({ teacherId, roomId }) {
    return (
        <div>
            <h3>Teacher Camera</h3>
            <StudentCamera studentId={teacherId} roomId={roomId} />
        </div>
    );
}
