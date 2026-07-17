import { useNavigate } from "react-router-dom";
import { enrollCourse } from "../api/enrollmentApi";

const STUDENT_ID = "6841a1b2c3d4e5f603333331";

function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleEnroll = async (e) => {
    e.stopPropagation();
    try {
      await enrollCourse({ studentId: STUDENT_ID, courseId: course._id });
      alert("Đăng ký khóa học thành công!");
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      alert(msg);
    }
  };

  return (
    <div
      className="course-card"
      onClick={() => navigate(`/courses/${course._id}`)}
      style={{ cursor: "pointer" }}
    >
      <img
        src={course.image || "https://via.placeholder.com/300x160?text=No+Image"}
        alt={course.title}
        className="course-image"
      />
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        <p className="course-language">{course.language}</p>
        <p className="course-price">${course.price}</p>
        <button
          className="btn btn-primary"
          onClick={handleEnroll}
        >
          Enroll
        </button>
      </div>
    </div>
  );
}

export default CourseCard;