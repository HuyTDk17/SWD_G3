import { useEffect, useState } from "react";
import { getEnrolledCourses, unenrollCourse, togglePin } from "../api/enrollmentApi";

const STUDENT_ID = "6841a1b2c3d4e5f603333331";

function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getEnrolledCourses(STUDENT_ID);
        setEnrollments(res.data);
      } catch (err) {
        setError("Không tải được danh sách khóa học. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đăng ký khóa học này?")) return;
    try {
      await unenrollCourse(enrollmentId);
      setEnrollments(prev => prev.filter(e => e._id !== enrollmentId));
      alert("Hủy đăng ký thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Hủy đăng ký thất bại.");
    }
  };

  const handleTogglePin = async (enrollmentId) => {
    try {
      const res = await togglePin(enrollmentId);
      setEnrollments(prev =>
        prev.map(e => e._id === enrollmentId ? { ...e, isPinned: res.data.isPinned } : e)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Ghim/bỏ ghim thất bại.");
    }
  };

  if (loading) return <div className="container"><p>Đang tải...</p></div>;
  if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;

  // Pinned lên đầu
  const sorted = [...enrollments].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="container">
      <h1 className="page-title">My Courses</h1>

      {sorted.length === 0 ? (
        <p>Bạn chưa đăng ký khóa học nào.</p>
      ) : (
        <div className="course-grid">
          {sorted.map(item => (
            <div key={item._id} className="course-card">
              {item.courseId?.image && (
                <img
                  src={item.courseId.image}
                  alt={item.courseId?.title}
                  className="course-image"
                />
              )}
              <div className="course-content">
                <h3 className="course-title">
                  {item.isPinned && <span>📌 </span>}
                  {item.courseId?.title || "Khóa học không còn tồn tại"}
                </h3>
                <p className="course-description">{item.courseId?.description}</p>
                <p className="course-language">{item.courseId?.language}</p>
                <p className="course-price">${item.courseId?.price}</p>

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleTogglePin(item._id)}
                  >
                    {item.isPinned ? "Bỏ ghim" : "Ghim"}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleUnenroll(item._id)}
                  >
                    Hủy đăng ký
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;