import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Paper, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CourseForm from "../../components/course/CourseForm";
import courseService from "../../services/courseService";

function CourseEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const loadCourse = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await courseService.getCourseById(id);
          setCourse(data);
        } catch (err) {
          console.error(err);
          setError("Failed to load course details.");
        } finally {
          setLoading(false);
        }
      };
      loadCourse();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      setError(null);

      if (isEditMode) {
        await courseService.updateCourse(id, payload);
        alert("Course updated successfully!");
      } else {
        await courseService.createCourse(payload);
        alert("Course created successfully as draft!");
      }

      navigate("/teacher/courses");
    } catch (err) {
      console.error(err);
      setError(courseService.getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading course editor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/teacher/courses")}
        sx={{ mb: 3 }}
      >
        Back to Courses
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
          {isEditMode ? "Edit Course" : "Create New Course"}
        </Typography>

        <CourseForm
          initialData={course}
          onSubmit={handleSubmit}
          saving={saving}
          error={error}
        />
      </Paper>
    </Container>
  );
}

export default CourseEditorPage;
