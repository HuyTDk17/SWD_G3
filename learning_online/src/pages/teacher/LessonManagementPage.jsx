import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import lessonService from "../../services/lessonService";
import courseService from "../../services/courseService";
import quizService from "../../services/quizService";

function LessonManagementPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reordering, setReordering] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, lessonsData, quizzesData] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getLessons(courseId),
        quizService.getQuizzes(courseId)
      ]);
      setCourse(courseData);
      setLessons(lessonsData.sort((a, b) => a.order - b.order));
      setQuizzes(quizzesData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load course curriculum details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizDelete = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz permanently?")) return;
    try {
      await quizService.deleteQuiz(courseId, quizId);
      alert("Quiz deleted successfully!");
      loadData();
    } catch (err) {
      alert(quizService.getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleMove = async (index, direction) => {
    if (reordering) return;
    const newLessons = [...lessons];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap
    const temp = newLessons[index];
    newLessons[index] = newLessons[targetIndex];
    newLessons[targetIndex] = temp;

    // Temporarily update local state for quick responsiveness
    setLessons(newLessons.map((l, idx) => ({ ...l, order: idx + 1 })));

    try {
      setReordering(true);
      const lessonIds = newLessons.map((l) => l._id);
      const updated = await lessonService.reorderLessons(courseId, lessonIds);
      setLessons(updated.sort((a, b) => a.order - b.order));
    } catch (err) {
      alert("Failed to save reordered list: " + lessonService.getErrorMessage(err));
      loadData(); // reload
    } finally {
      setReordering(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson permanently?")) return;
    try {
      await lessonService.deleteLesson(courseId, id);
      alert("Lesson deleted successfully!");
      loadData();
    } catch (err) {
      alert(lessonService.getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading curriculum details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/teacher/courses")}
        sx={{ mb: 3 }}
      >
        Back to Courses
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Curriculum Builder
          </Typography>
          <Typography color="text.secondary" variant="body1">
            Course: <strong>{course?.title}</strong> ({course?.language})
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to={`/teacher/courses/${courseId}/lessons/new`}
          sx={{ borderRadius: 2 }}
        >
          Add Lesson
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {lessons.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            This course currently has no lessons.
          </Typography>
          <Button
            variant="outlined"
            component={RouterLink}
            to={`/teacher/courses/${courseId}/lessons/new`}
            startIcon={<AddIcon />}
          >
            Create Your First Lesson
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell width={80}>Order</TableCell>
                <TableCell>Lesson Title</TableCell>
                <TableCell>Estimate</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.map((lesson, index) => (
                <TableRow key={lesson._id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {lesson.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: "block" }}>
                      {lesson.description || "No description provided."}
                    </Typography>
                  </TableCell>
                  <TableCell>{lesson.estimatedMinutes} mins</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {lesson.contentType.map((type) => (
                        <Chip key={type} label={type.toUpperCase()} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lesson.status.toUpperCase()}
                      color={lesson.status === "published" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      {/* Move Up */}
                      <IconButton
                        size="small"
                        disabled={index === 0 || reordering}
                        onClick={() => handleMove(index, "up")}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>

                      {/* Move Down */}
                      <IconButton
                        size="small"
                        disabled={index === lessons.length - 1 || reordering}
                        onClick={() => handleMove(index, "down")}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>

                      {/* Edit */}
                      <Tooltip title="Edit Lesson">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/teacher/courses/${courseId}/lessons/edit/${lesson._id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip title="Delete Lesson">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(lesson._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Quizzes List Section */}
      <Box sx={{ mt: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
              Quizzes & Assessments
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Assess student learning through multiple-choice quizzes linked to lessons or final exams.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="warning"
            startIcon={<AddIcon />}
            component={RouterLink}
            to={`/teacher/courses/${courseId}/quizzes/new`}
            sx={{ borderRadius: 2 }}
          >
            Create Quiz
          </Button>
        </Box>

        {quizzes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px dashed #ccc" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No quizzes created for this course yet.
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              component={RouterLink}
              to={`/teacher/courses/${courseId}/quizzes/new`}
              startIcon={<AddIcon />}
            >
              Add Your First Quiz
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell>Quiz Title</TableCell>
                  <TableCell>Linked Lesson</TableCell>
                  <TableCell>Time Limit</TableCell>
                  <TableCell>Max Attempts</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((quiz) => {
                  const linkedLesson = lessons.find(l => l._id === (quiz.lessonId?._id || quiz.lessonId));
                  return (
                    <TableRow key={quiz._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {quiz.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {linkedLesson ? (
                          <Chip label={linkedLesson.title} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Course Quiz (Final)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} mins` : "Unlimited"}
                      </TableCell>
                      <TableCell>{quiz.maxAttempts}</TableCell>
                      <TableCell>
                        <Chip
                          label={quiz.status.toUpperCase()}
                          color={quiz.status === "published" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          {/* Edit */}
                          <Tooltip title="Edit Quiz">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => navigate(`/teacher/courses/${courseId}/quizzes/edit/${quiz._id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip title="Delete Quiz">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleQuizDelete(quiz._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
}

export default LessonManagementPage;
