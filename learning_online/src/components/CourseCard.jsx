import { useNavigate } from "react-router-dom";
import { enrollCourse } from "../api/enrollmentApi";
import { Box, Chip, Rating, Typography } from "@mui/material";
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
      onClick={() => navigate(`/courses/${course.slug}`)}
      style={{ cursor: "pointer" }}
    >
      <img
        src={course.image || "https://via.placeholder.com/300x160?text=No+Image"}
        alt={course.title}
        className="course-image"
      />
      <div className="course-content">
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
          <Chip label={course.language} size="small" color="primary" variant="outlined" />
          <Chip label={course.cefrLevel} size="small" color="secondary" variant="outlined" />
          <Chip label={course.category} size="small" variant="outlined" />
        </Box>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, my: 1 }}>
          <Rating value={course.averageRating || 0} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            ({course.reviewCount || 0})
          </Typography>
        </Box>
        
        <p className="course-lessons" style={{ fontSize: "13px", color: "#666" }}>
          📚 {course.lessonCount || 0} lessons
        </p>

        <p className="course-price" style={{ fontWeight: 700, fontSize: "18px", color: "#1976d2", margin: "8px 0" }}>
          {course.price === 0 ? "Free" : `$${course.price}`}
        </p>
        <button
          className="btn btn-primary"
          onClick={handleEnroll}
          style={{ width: "100%" }}
        >
          Enroll
        </button>
      </div>
    </div>
  );
}

export default CourseCard;