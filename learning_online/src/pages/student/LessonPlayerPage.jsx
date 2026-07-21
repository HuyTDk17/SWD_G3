import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Stack
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import TranslateIcon from "@mui/icons-material/Translate";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MovieIcon from "@mui/icons-material/Movie";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import DownloadIcon from "@mui/icons-material/Download";
import courseService from "../../services/courseService";
import lessonService from "../../services/lessonService";
import quizService from "../../services/quizService";

function LessonPlayerPage() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeLessonDetail, setActiveLessonDetail] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [detailError, setDetailError] = useState(null);

  const loadCourseAndLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const courseData = await courseService.getCourseBySlug(courseSlug);
      setCourse(courseData);

      const [lessonsData, quizzesData] = await Promise.all([
        lessonService.getLessons(courseData._id),
        quizService.getQuizzes(courseData._id)
      ]);

      const sortedLessons = lessonsData.sort((a, b) => a.order - b.order);
      setLessons(sortedLessons);
      setQuizzes(quizzesData || []);

      // Select first unlocked lesson by default
      if (sortedLessons.length > 0) {
        let defaultSelect = sortedLessons[0];
        // If sequential, select the first uncompleted lesson
        if (courseData.isSequential) {
          const firstUncompleted = sortedLessons.find(l => !l.isCompleted);
          if (firstUncompleted) {
            defaultSelect = firstUncompleted;
          }
        }
        setActiveLesson(defaultSelect);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load course details. Ensure you are enrolled.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseAndLessons();
  }, [courseSlug]);

  const loadLessonDetail = async (lesson) => {
    if (!lesson) return;
    try {
      setLoadingDetail(true);
      setDetailError(null);
      const detail = await lessonService.getLessonById(course._id, lesson._id);
      setActiveLessonDetail(detail);
    } catch (err) {
      console.error(err);
      setDetailError("This lesson is locked. Complete the prior lessons to unlock it!");
      setActiveLessonDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (activeLesson && course) {
      loadLessonDetail(activeLesson);
    }
  }, [activeLesson, course]);

  const isLessonLocked = (index) => {
    if (!course?.isSequential) return false;
    for (let i = 0; i < index; i++) {
      if (!lessons[i].isCompleted) return true;
    }
    return false;
  };

  const handleLessonSelect = (lesson, index) => {
    if (isLessonLocked(index)) {
      alert("This lesson is locked! Complete prior lessons first.");
      return;
    }
    setActiveLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!activeLessonDetail || completing) return;
    try {
      setCompleting(true);
      await lessonService.completeLesson(course._id, activeLessonDetail._id);
      alert("Lesson completed!");
      
      // Reload lessons to update status and unlocks
      const lessonsData = await lessonService.getLessons(course._id);
      const sortedLessons = lessonsData.sort((a, b) => a.order - b.order);
      setLessons(sortedLessons);

      // Automatically select the next lesson if available
      const currentIndex = sortedLessons.findIndex(l => l._id === activeLessonDetail._id);
      if (currentIndex !== -1 && currentIndex < sortedLessons.length - 1) {
        setActiveLesson(sortedLessons[currentIndex + 1]);
      } else {
        // Just reload the current detail
        loadLessonDetail(activeLessonDetail);
      }
    } catch (err) {
      alert("Failed to mark complete: " + lessonService.getErrorMessage(err));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Initializing player...</Typography>
      </Container>
    );
  }

  if (error || !course) {
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

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Sidebar Curriculum (Left) */}
      <Paper
        square
        elevation={3}
        sx={{
          width: 320,
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          bgcolor: "grey.50"
        }}
      >
        <Box sx={{ p: 2.5, bgcolor: "primary.main", color: "white" }}>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/courses/${courseSlug}`)}
            size="small"
            sx={{ mb: 1, textTransform: "none", opacity: 0.9 }}
          >
            Course Page
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 800, noWrap: true }}>
            {course.title}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>
            Progress: {lessons.filter(l => l.isCompleted).length} / {lessons.length} Completed
          </Typography>
          <Button
            color="inherit"
            variant="outlined"
            onClick={() => navigate(`/courses/${courseSlug}/progress`)}
            size="small"
            fullWidth
            sx={{
              mt: 1.5,
              textTransform: "none",
              borderColor: "rgba(255,255,255,0.5)",
              color: "white",
              "&:hover": { borderColor: "white" }
            }}
          >
            Track My Progress
          </Button>
        </Box>

        <Divider />

        <List sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
          {lessons.map((lesson, index) => {
            const locked = isLessonLocked(index);
            const active = activeLesson?._id === lesson._id;

            return (
              <ListItemButton
                key={lesson._id}
                selected={active}
                disabled={locked}
                onClick={() => handleLessonSelect(lesson, index)}
                sx={{
                  py: 2,
                  borderBottom: "1px solid #eaeaea",
                  "&.Mui-selected": { bgcolor: "primary.light", color: "primary.contrastText" }
                }}
              >
                <ListItemIcon sx={{ color: active ? "white" : "inherit" }}>
                  {lesson.isCompleted ? (
                    <CheckCircleIcon color="success" />
                  ) : locked ? (
                    <LockIcon color="disabled" />
                  ) : (
                    <PlayArrowIcon color={active ? "white" : "primary"} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {index + 1}. {lesson.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color={active ? "grey.200" : "text.secondary"}>
                      {lesson.estimatedMinutes} mins
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
          
          {quizzes.filter(q => !q.lessonId).map((quiz) => (
            <ListItemButton
              key={quiz._id}
              onClick={() => navigate(`/courses/${courseSlug}/quizzes/${quiz._id}/take`)}
              sx={{
                py: 2,
                borderBottom: "1px solid #eaeaea",
                bgcolor: "#fff3e0",
                "&:hover": { bgcolor: "#ffe0b2" }
              }}
            >
              <ListItemIcon>
                <CheckCircleIcon color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Final Assessment: {quiz.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Requires Passing Score: {quiz.passingScore}%
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Main Content Player (Right) */}
      <Box sx={{ flexGrow: 1, p: 4, overflowY: "auto", bgcolor: "#fcfcfc" }}>
        {lessons.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              This course does not have any published lessons yet.
            </Typography>
          </Box>
        ) : loadingDetail ? (
          <Typography variant="h6">Loading lesson content...</Typography>
        ) : detailError ? (
          <Alert severity="warning">{detailError}</Alert>
        ) : activeLessonDetail ? (
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            {/* Title & Estimated Minutes */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1 }}>
                {activeLessonDetail.title}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip label={`${activeLessonDetail.estimatedMinutes} Mins`} size="small" color="primary" />
                {activeLessonDetail.isCompleted && (
                  <Chip icon={<CheckCircleIcon />} label="Completed" size="small" color="success" />
                )}
              </Box>
            </Box>

            {/* Video Player */}
            {activeLessonDetail.contentType.includes("video") && activeLessonDetail.videoAssetId && (
              <Paper sx={{ p: 2, mb: 4, bgcolor: "black", borderRadius: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
                  <MovieIcon sx={{ fontSize: 60, color: "white", mr: 2 }} />
                  <Typography variant="h6" color="white">
                    Video Content: <a href={activeLessonDetail.videoAssetId.url} target="_blank" rel="noreferrer" style={{ color: "#2196f3" }}>Play Video</a>
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Audio Player */}
            {activeLessonDetail.contentType.includes("audio") && activeLessonDetail.audioAssetId && (
              <Card sx={{ mb: 4, bgcolor: "#f0f4c3", borderRadius: 3 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <VolumeUpIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Listening Section
                    </Typography>
                    <audio controls style={{ width: "100%", marginTop: "8px" }}>
                      <source src={activeLessonDetail.audioAssetId.url} type={activeLessonDetail.audioAssetId.mimeType || "audio/mpeg"} />
                      Your browser does not support the audio element.
                    </audio>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Text Description / Content */}
            {activeLessonDetail.contentType.includes("text") && activeLessonDetail.textContent && (
              <Paper sx={{ p: 4, borderRadius: 3, mb: 4, boxShadow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Lesson Text Notes
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                  {activeLessonDetail.textContent}
                </Typography>
              </Paper>
            )}

            {/* Grammar Section */}
            {activeLessonDetail.contentType.includes("grammar") && activeLessonDetail.grammarNotes && (
              <Paper sx={{ p: 4, borderRadius: 3, mb: 4, bgcolor: "#e0f2f1", borderLeft: "5px solid #009688" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <MenuBookIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#00796b" }}>
                    Grammar Rules
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                  {activeLessonDetail.grammarNotes}
                </Typography>
              </Paper>
            )}

            {/* Vocabulary Section */}
            {activeLessonDetail.contentType.includes("vocabulary") && activeLessonDetail.vocabulary.length > 0 && (
              <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <TranslateIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Vocabulary List
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {activeLessonDetail.vocabulary.map((v, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                        <CardContent>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                            {v.word}
                          </Typography>
                          {v.pronunciation && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              Pronunciation: [{v.pronunciation}]
                            </Typography>
                          )}
                          <Typography variant="body2">
                            Meaning: <strong>{v.translation}</strong>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Supplementary Resources (PDF) */}
            {activeLessonDetail.resourceAssetIds && activeLessonDetail.resourceAssetIds.length > 0 && (
              <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Attachments & Handouts
                </Typography>
                <Stack spacing={1}>
                  {activeLessonDetail.resourceAssetIds.map((res) => (
                    <Button
                      key={res._id}
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={res.url}
                      target="_blank"
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      {res.originalName} ({Math.round(res.sizeBytes / 1024)} KB)
                    </Button>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Linked Quiz */}
            {activeLessonDetail && quizzes.find(q => q.lessonId && (q.lessonId._id || q.lessonId || '').toString() === activeLessonDetail._id.toString()) && (
              (() => {
                const quiz = quizzes.find(q => q.lessonId && (q.lessonId._id || q.lessonId || '').toString() === activeLessonDetail._id.toString());
                return (
                  <Card sx={{ mt: 4, mb: 2, border: "1px solid #ffcc80", bgcolor: "#fff8e1", borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: "warning.dark" }}>
                            Lesson Assessment: {quiz.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Passing Score: {quiz.passingScore}% • Time Limit: {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} mins` : "None"}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => navigate(`/courses/${courseSlug}/quizzes/${quiz._id}/take`)}
                          sx={{ fontWeight: 700 }}
                        >
                          Take Assessment
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })()
            )}

            {/* Mark Complete Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 6, mb: 4 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                disabled={activeLessonDetail.isCompleted || completing}
                onClick={handleMarkComplete}
                sx={{ py: 1.5, px: 6, borderRadius: 3, fontWeight: 700 }}
              >
                {activeLessonDetail.isCompleted
                  ? "Lesson Completed ✓"
                  : completing
                  ? "Marking complete..."
                  : "Mark Complete & Next →"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="h6">Select a lesson to begin learning.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default LessonPlayerPage;
