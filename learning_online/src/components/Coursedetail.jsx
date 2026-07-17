import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../api/courseApi";
import { enrollCourse } from "../api/enrollmentApi";

const STUDENT_ID = "6841a1b2c3d4e5f603333331";

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCourseById(id);
        setCourse(res.data);
      } catch (err) {
        setError("Không tìm thấy khóa học.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollCourse({ studentId: STUDENT_ID, courseId: id });
      alert("Đăng ký khóa học thành công!");
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng ký thất bại.";
      alert(msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="container"><p>Đang tải...</p></div>;
  if (error) return (
    <div className="container">
      <p style={{ color: "red" }}>{error}</p>
      <button className="btn btn-secondary" onClick={() => navigate("/")}>← Quay lại</button>
    </div>
  );

  return (
    <div className="container">
      <button
        className="btn btn-secondary"
        onClick={() => navigate("/")}
        style={{ marginBottom: "24px" }}
      >
        ← Quay lại
      </button>

      <div className="course-detail">
        <img
          src={course.image || "https://via.placeholder.com/800x400?text=No+Image"}
          alt={course.title}
          className="course-detail-image"
        />

        <div className="course-detail-content">
          <h1 className="course-detail-title">{course.title}</h1>

          <div className="course-detail-meta">
            <span className="badge">{course.language}</span>
            <span className="course-detail-price">${course.price}</span>
          </div>

          <div className="course-detail-section">
            <h2>Mô tả khóa học</h2>
            <p>{course.description}</p>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? "Đang đăng ký..." : "Enroll ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;