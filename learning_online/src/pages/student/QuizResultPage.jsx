import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import quizService from "../../services/quizService";
import courseService from "../../services/courseService";

function QuizResultPage() {
  const { courseSlug, quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError(null);

        const courseData = await courseService.getCourseBySlug(courseSlug);

        const data = await quizService.getAttemptResult(courseData._id, quizId, attemptId);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError(quizService.getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [courseSlug, quizId, attemptId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading graded result details...</Typography>
      </Container>
    );
  }

  if (error || !result) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", bgcolor: "#ffebee", p: 4, borderRadius: 3 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || "Failed to load graded results."}
          </Typography>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/courses/${courseSlug}/play`)}>
            Back to Lessons
          </Button>
        </Box>
      </Container>
    );
  }

  const { score, isPassed, details, timeSpentSeconds, passingScore } = result;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/courses/${courseSlug}/play`)}
        sx={{ mb: 3 }}
      >
        Back to Player
      </Button>

      {/* Grade Card */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          mb: 4,
          textAlign: "center",
          bgcolor: isPassed ? "#e8f5e9" : "#ffebee",
          border: "2px solid",
          borderColor: isPassed ? "success.main" : "error.main"
        }}
      >
        <Typography variant="h6" sx={{ color: isPassed ? "success.dark" : "error.dark", fontWeight: 700, mb: 1 }}>
          {isPassed ? "CONGRATULATIONS! YOU PASSED" : "ATTEMPT FAILED"}
        </Typography>

        <Typography variant="h2" sx={{ fontWeight: 800, my: 2, color: isPassed ? "success.main" : "error.main" }}>
          {score}%
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Passing Score: <strong>{passingScore}%</strong> • Time Spent: <strong>{Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s</strong>
        </Typography>

        <Chip
          icon={isPassed ? <CheckCircleIcon /> : <CancelIcon />}
          label={isPassed ? "PASSED" : "FAILED"}
          color={isPassed ? "success" : "error"}
          sx={{ px: 2, py: 2.5, fontWeight: 700, fontSize: "16px" }}
        />
      </Paper>

      {/* Graded Details */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        Question Review
      </Typography>

      <Stack spacing={4}>
        {details.map((q, index) => {
          return (
            <Card
              key={q.questionId}
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderLeft: "5px solid",
                borderColor: q.isCorrect ? "success.main" : "error.main"
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Question {index + 1}: {q.prompt}
                  </Typography>
                  <Chip
                    label={q.isCorrect ? "Correct" : "Incorrect"}
                    color={q.isCorrect ? "success" : "error"}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  {q.options.map((opt) => {
                    let optionColor = "inherit";
                    let optionWeight = "normal";
                    let optionBg = "transparent";

                    if (opt.id === q.correctAnswer) {
                      optionColor = "success.main";
                      optionWeight = "bold";
                      optionBg = "#e8f5e9";
                    } else if (opt.id === q.studentAnswer && !q.isCorrect) {
                      optionColor = "error.main";
                      optionWeight = "bold";
                      optionBg = "#ffebee";
                    }

                    return (
                      <Box
                        key={opt.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid #eaeaea",
                          bgcolor: optionBg,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Typography variant="body2" sx={{ color: optionColor, fontWeight: optionWeight }}>
                          <strong>{opt.id.toUpperCase()}.</strong> {opt.text}
                          {opt.id === q.correctAnswer && " (Correct Answer)"}
                          {opt.id === q.studentAnswer && !q.isCorrect && " (Your Answer)"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>

                {q.explanation && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Explanation:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {q.explanation}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <Button variant="contained" size="large" onClick={() => navigate(`/courses/${courseSlug}/play`)}>
          Continue Study
        </Button>
      </Box>
    </Container>
  );
}

export default QuizResultPage;
