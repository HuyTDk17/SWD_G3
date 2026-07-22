import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Stack,
  Alert,
  IconButton,
  Divider,
  Card,
  CardContent
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import quizService from "../../services/quizService";
import lessonService from "../../services/lessonService";

function QuizBuilderPage() {
  const { courseId, id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    timeLimitMinutes: "",
    maxAttempts: 3,
    passingScore: 70,
    status: "draft",
    lessonId: "", // Optional lesson link
    questions: [] // Array of { prompt, type: 'multiple_choice', options: [{id, text}], correctAnswer, points, explanation }
  });

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadLessons = async () => {
      try {
        const data = await lessonService.getLessons(courseId);
        setLessons(data || []);
      } catch (err) {
        console.error("Failed to load lessons for linking:", err);
      }
    };
    loadLessons();

    if (isEditMode) {
      const loadQuiz = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await quizService.getQuizById(courseId, id);
          
          setForm({
            title: data.title || "",
            timeLimitMinutes: data.timeLimitMinutes ?? "",
            maxAttempts: data.maxAttempts ?? 3,
            passingScore: data.passingScore ?? 70,
            status: data.status || "draft",
            lessonId: data.lessonId?._id || data.lessonId || "",
            questions: (data.questions || []).map(q => ({
              prompt: q.prompt || "",
              type: q.type || "multiple_choice",
              correctAnswer: q.correctAnswer || "a",
              points: q.points ?? 1,
              explanation: q.explanation || "",
              options: q.options || [
                { id: "a", text: "" },
                { id: "b", text: "" },
                { id: "c", text: "" },
                { id: "d", text: "" }
              ]
            }))
          });
        } catch (err) {
          console.error(err);
          setError("Failed to load quiz details.");
        } finally {
          setLoading(false);
        }
      };
      loadQuiz();
    }
  }, [courseId, id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          prompt: "",
          type: "multiple_choice",
          correctAnswer: "a",
          points: 1,
          explanation: "",
          options: [
            { id: "a", text: "" },
            { id: "b", text: "" },
            { id: "c", text: "" },
            { id: "d", text: "" }
          ]
        }
      ]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options[oIndex] = { ...options[oIndex], text: value };
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Simple validation
      if (!form.title.trim()) {
        throw new Error("Quiz title is required");
      }
      if (form.questions.length === 0) {
        throw new Error("Please add at least 1 question to the quiz.");
      }

      // Check options are filled out
      for (const [idx, q] of form.questions.entries()) {
        if (!q.prompt.trim()) {
          throw new Error(`Question ${idx + 1} prompt cannot be empty`);
        }
        for (const opt of q.options) {
          if (!opt.text.trim()) {
            throw new Error(`Option ${opt.id.toUpperCase()} of Question ${idx + 1} cannot be empty`);
          }
        }
      }

      const payload = {
        ...form,
        timeLimitMinutes: form.timeLimitMinutes !== "" ? Number(form.timeLimitMinutes) : null,
        maxAttempts: Number(form.maxAttempts),
        passingScore: Number(form.passingScore),
        lessonId: form.lessonId || null
      };

      if (isEditMode) {
        await quizService.updateQuiz(courseId, id, payload);
        alert("Quiz updated successfully!");
      } else {
        await quizService.createQuiz(courseId, payload);
        alert("Quiz created successfully!");
      }

      navigate(`/teacher/courses/${courseId}/lessons`);
    } catch (err) {
      console.error(err);
      setError(err.message || quizService.getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading quiz builder...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/teacher/courses/${courseId}/lessons`)}
        sx={{ mb: 3 }}
      >
        Back to Curriculum
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
          {isEditMode ? "Edit Quiz" : "Create Quiz (MCQ)"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                name="title"
                label="Quiz Title"
                fullWidth
                required
                value={form.title}
                onChange={handleChange}
              />
            </Grid>

            {/* Configs */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="timeLimitMinutes"
                label="Time Limit (minutes - optional)"
                type="number"
                fullWidth
                placeholder="Unlimited if empty"
                value={form.timeLimitMinutes}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="maxAttempts"
                label="Max Attempts"
                type="number"
                fullWidth
                required
                inputProps={{ min: 1 }}
                value={form.maxAttempts}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="passingScore"
                label="Passing Score (%)"
                type="number"
                fullWidth
                required
                inputProps={{ min: 0, max: 100 }}
                value={form.passingScore}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="lessonId"
                label="Link to Lesson (optional)"
                fullWidth
                value={form.lessonId}
                onChange={handleChange}
              >
                <MenuItem value=""><em>None (Course Quiz)</em></MenuItem>
                {lessons.map((lesson) => (
                  <MenuItem key={lesson._id} value={lesson._id}>
                    Lesson: {lesson.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="status"
                label="Publication Status"
                fullWidth
                value={form.status}
                onChange={handleChange}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>
            </Grid>

            {/* Questions builder */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Questions ({form.questions.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddQuestion}
                  size="small"
                >
                  Add Question
                </Button>
              </Box>

              {form.questions.length === 0 ? (
                <Alert severity="info" sx={{ py: 3 }}>
                  No questions added yet. Click "Add Question" to begin authoring MCQs.
                </Alert>
              ) : (
                <Stack spacing={4}>
                  {form.questions.map((q, qIndex) => (
                    <Card key={qIndex} variant="outlined" sx={{ borderRadius: 3, boxShadow: 1 }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            Question {qIndex + 1}
                          </Typography>
                          <IconButton color="error" size="small" onClick={() => handleRemoveQuestion(qIndex)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Grid container spacing={2}>
                          {/* Question Prompt */}
                          <Grid size={{ xs: 12, sm: 9 }}>
                            <TextField
                              label="Question Prompt"
                              fullWidth
                              required
                              size="small"
                              value={q.prompt}
                              onChange={(e) => handleQuestionChange(qIndex, "prompt", e.target.value)}
                            />
                          </Grid>
                          {/* Points */}
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              label="Points"
                              type="number"
                              fullWidth
                              required
                              size="small"
                              inputProps={{ min: 1 }}
                              value={q.points}
                              onChange={(e) => handleQuestionChange(qIndex, "points", Number(e.target.value))}
                            />
                          </Grid>

                          {/* Options Builder */}
                          {q.options.map((opt, oIndex) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={opt.id}>
                              <TextField
                                label={`Option ${opt.id.toUpperCase()}`}
                                fullWidth
                                required
                                size="small"
                                value={opt.text}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              />
                            </Grid>
                          ))}

                          {/* Correct Answer Selection */}
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              label="Correct Answer Option"
                              fullWidth
                              size="small"
                              value={q.correctAnswer}
                              onChange={(e) => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
                            >
                              <MenuItem value="a">Option A</MenuItem>
                              <MenuItem value="b">Option B</MenuItem>
                              <MenuItem value="c">Option C</MenuItem>
                              <MenuItem value="d">Option D</MenuItem>
                            </TextField>
                          </Grid>

                          {/* Explanation */}
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Explanation (optional)"
                              fullWidth
                              size="small"
                              value={q.explanation}
                              onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            sx={{ mt: 4, py: 1.5, px: 6, borderRadius: 2 }}
          >
            {saving ? "Saving..." : "Save Quiz"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default QuizBuilderPage;
