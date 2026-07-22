import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import courseService from "../../services/courseService";
import { getProgress } from "../../api/progressApi";

function ProgressPage() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError(null);

        const courseData = await courseService.getCourseBySlug(courseSlug);
        setCourse(courseData);

        const progressRes = await getProgress(courseData._id);
        setData(progressRes.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load your study progress data.");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [courseSlug]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading progress metrics...</Typography>
      </Container>
    );
  }

  if (error || !course || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", bgcolor: "#ffebee", p: 4, borderRadius: 3 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || "Access Denied"}
          </Typography>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/courses/${courseSlug}`)}>
            Back to Course Details
          </Button>
        </Box>
      </Container>
    );
  }

  const { progress, lessonProgress, quizProgress } = data;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/courses/${courseSlug}/play`)}
        sx={{ mb: 3 }}
      >
        Back to Lesson Player
      </Button>

      {/* Course Title and Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Your Study Progress
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Course: <strong>{course.title}</strong>
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Radial Completion Percentage Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center"
            }}
          >
            <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={progress.completionPercent}
                size={140}
                thickness={6}
                color="primary"
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography variant="h4" component="div" sx={{ fontWeight: 800 }}>
                  {progress.completionPercent}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Course Completed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Keep learning to reach 100%!
            </Typography>
          </Paper>
        </Grid>

        {/* Study Stats Grid */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            {/* Lessons Stats */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "primary.light", borderRadius: 2, color: "primary.main" }}>
                    <SchoolIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Lessons Completed
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {progress.lessonsCompleted} / {progress.totalLessons}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quizzes Stats */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "warning.light", borderRadius: 2, color: "warning.main" }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Quizzes Passed
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {progress.quizzesPassed}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Streak Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "error.light", borderRadius: 2, color: "error.main" }}>
                    <LocalFireDepartmentIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Current Streak
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {progress.currentStreak} Days
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Last Studied Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "success.light", borderRadius: 2, color: "success.main" }}>
                    <CalendarTodayIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last Studied
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {progress.lastStudiedAt ? new Date(progress.lastStudiedAt).toLocaleDateString() : "Never"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Curriculum checklists */}
      <Grid container spacing={4}>
        {/* Lessons checklist */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Lessons Progress
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              {lessonProgress.map((item, idx) => (
                <ListItem
                  key={item._id}
                  secondaryAction={
                    <Chip
                      label={item.isCompleted ? "Completed" : "Incomplete"}
                      color={item.isCompleted ? "success" : "default"}
                      size="small"
                    />
                  }
                  sx={{ py: 1.5, borderBottom: "1px solid #eaeaea" }}
                >
                  <ListItemIcon>
                    {item.isCompleted ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {idx + 1}. {item.lessonId?.title || "Lesson"}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {item.lessonId?.estimatedMinutes} Mins
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quizzes Checklist */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Quizzes Progress
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {quizProgress.length === 0 ? (
              <Alert severity="info">No published quizzes for this course yet.</Alert>
            ) : (
              <List>
                {quizProgress.map((quiz) => (
                  <ListItem
                    key={quiz.quizId}
                    secondaryAction={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {quiz.bestScore !== null && (
                          <Chip label={`Best: ${quiz.bestScore}%`} size="small" />
                        )}
                        <Chip
                          label={quiz.isPassed ? "Passed" : quiz.attemptsCount > 0 ? "Failed" : "Unattempted"}
                          color={quiz.isPassed ? "success" : quiz.attemptsCount > 0 ? "error" : "default"}
                          size="small"
                        />
                      </Box>
                    }
                    sx={{ py: 1.5, borderBottom: "1px solid #eaeaea" }}
                  >
                    <ListItemIcon>
                      {quiz.isPassed ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <RadioButtonUncheckedIcon color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {quiz.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Attempts: {quiz.attemptsCount} • Pass Score: {quiz.passingScore}%
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProgressPage;
