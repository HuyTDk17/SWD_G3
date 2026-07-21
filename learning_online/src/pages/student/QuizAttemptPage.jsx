import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import quizService from "../../services/quizService";
import courseService from "../../services/courseService";

function QuizAttemptPage() {
  const { courseSlug, quizId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // [{ questionId, value }]
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const timerRef = useRef(null);

  const initAttempt = async () => {
    try {
      setLoading(true);
      setError(null);

      const courseData = await courseService.getCourseBySlug(courseSlug);
      setCourse(courseData);

      const result = await quizService.startAttempt(courseData._id, quizId);
      setAttempt(result.attempt);
      setQuestions(result.questions);

      // Pre-fill empty selections
      setAnswers(result.questions.map(q => ({ questionId: q._id, value: "" })));

      // Initialize Timer
      if (result.attempt.timeLimitMinutes) {
        setTimeLeft(result.attempt.timeLimitMinutes * 60);
      }
    } catch (err) {
      console.error(err);
      setError(quizService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAttempt();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [courseSlug, quizId]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isAutoSubmit && !window.confirm("Are you sure you want to submit your answers?")) {
      // Re-trigger timer
      startTimer();
      return;
    }

    try {
      setSubmitting(true);
      const result = await quizService.submitAttempt(course._id, quizId, attempt.id, answers);
      alert(isAutoSubmit ? "Time's up! Your answers were automatically submitted." : "Quiz submitted successfully!");
      navigate(`/courses/${courseSlug}/quizzes/${quizId}/results/${attempt.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit answers: " + quizService.getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Auto submit
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !submitting) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, submitting]);

  const handleSelect = (questionId, value) => {
    setAnswers((prev) =>
      prev.map(item => (item.questionId === questionId ? { ...item, value } : item))
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading quiz attempt...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", bgcolor: "#ffebee", p: 4, borderRadius: 3 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/courses/${courseSlug}/play`)}>
            Back to Lessons
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Timer Bar */}
      {timeLeft !== null && (
        <Paper
          elevation={4}
          sx={{
            p: 2,
            position: "sticky",
            top: 20,
            zIndex: 100,
            mb: 4,
            borderRadius: 3,
            bgcolor: timeLeft < 60 ? "#ffebee" : "primary.main",
            color: timeLeft < 60 ? "#c62828" : "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <TimerIcon /> Time Remaining
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {formatTime(timeLeft)}
          </Typography>
        </Paper>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          {course?.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Attempt #{attempt?.attemptNumber} / {attempt?.maxAttempts}
        </Typography>
      </Box>

      <Stack spacing={4}>
        {questions.map((q, index) => {
          const selectedAnswer = answers.find(a => a.questionId === q._id)?.value || "";

          return (
            <Card key={q._id} sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Question {index + 1}: {q.prompt}
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedAnswer}
                    onChange={(e) => handleSelect(q._id, e.target.value)}
                  >
                    {q.options.map((opt) => (
                      <FormControlLabel
                        key={opt.id}
                        value={opt.id}
                        control={<Radio />}
                        label={
                          <Typography variant="body1" sx={{ py: 0.5 }}>
                            <strong>{opt.id.toUpperCase()}.</strong> {opt.text}
                          </Typography>
                        }
                        sx={{
                          border: "1px solid #eaeaea",
                          borderRadius: 2,
                          mb: 1.5,
                          ml: 0,
                          mr: 0,
                          px: 2,
                          "&:hover": { bgcolor: "grey.50" },
                          ...(selectedAnswer === opt.id && {
                            borderColor: "primary.main",
                            bgcolor: "primary.light",
                            color: "primary.contrastText"
                          })
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 6, mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={submitting}
          onClick={() => handleSubmit(false)}
          sx={{ py: 1.5, px: 6, borderRadius: 3, fontWeight: 700 }}
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </Box>
    </Container>
  );
}

export default QuizAttemptPage;
