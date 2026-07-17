import { useEffect, useState } from "react";
import { getCourses } from "../api/courseApi";
import CourseCard from "../components/CourseCard";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCourses();
        setCourses(res.data);
      } catch (err) {
        setError("Không tải được danh sách khóa học.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) return <div className="container"><p>Đang tải...</p></div>;
  if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;

  return (
    <div className="container">
      <h1 className="page-title">All Courses</h1>

      {courses.length === 0 ? (
        <p>Chưa có khóa học nào.</p>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;