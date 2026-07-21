import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { getEnrolledCourses, unenrollCourse, togglePin } from "../api/enrollmentApi";
import { useAuth } from "../contexts/AuthContext";

function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEnrolledCourses();
      setEnrollments(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your enrolled courses list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleTogglePin = async (enrollmentId) => {
    try {
      const res = await togglePin(enrollmentId);
      setEnrollments((prev) =>
        prev.map((e) => (e._id === enrollmentId ? { ...e, isPinned: res.data.isPinned } : e))
      );
    } catch (err) {
      alert("Failed to pin course: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to unenroll from this course? Your progress will be lost!")) return;
    try {
      await unenrollCourse(enrollmentId);
      setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
      alert("Unenrolled successfully!");
    } catch (err) {
      alert("Failed to unenroll: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading enrolled courses...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Sort pinned courses first
  const sortedEnrollments = [...enrollments].sort(
    (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
        My Enrolled Courses
      </Typography>

      {sortedEnrollments.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You are not enrolled in any courses yet.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Explore Course Catalog
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {sortedEnrollments.map((item) => {
            const course = item.courseId;
            if (!course) return null;

            // Expiration calculation logic (BR-ENROLL-002 / BR-ENROLL-004)
            const isExpired = item.status === "expired" || (item.expiresAt && new Date(item.expiresAt) < new Date());

            return (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                    ...(item.isPinned && { border: "2px solid #1976d2" })
                  }}
                >
                  {/* Pin button */}
                  <IconButton
                    onClick={() => handleTogglePin(item._id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(255, 255, 255, 0.8)",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                      color: item.isPinned ? "primary.main" : "grey.500",
                      zIndex: 10
                    }}
                    size="small"
                  >
                    {item.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="180"
                    image={course.image || "https://via.placeholder.com/350x180?text=No+Thumbnail"}
                    alt={course.title}
                  />

                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
                    <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Chip label={course.language} size="small" variant="outlined" />
                      <Chip
                        label={isExpired ? "EXPIRED" : item.status.toUpperCase()}
                        color={isExpired ? "error" : "success"}
                        size="small"
                      />
                    </Box>

                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                      {course.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        minHeight: 40
                      }}
                    >
                      {course.description}
                    </Typography>

                    {/* Progress tracking */}
                    <Box sx={{ mt: "auto", mb: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Course Progress
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {item.completionPercent}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.completionPercent || 0}
                        color={isExpired ? "inherit" : "primary"}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        disabled={isExpired}
                        onClick={() => navigate(`/courses/${course.slug}/play`)}
                        fullWidth
                        sx={{ borderRadius: 2 }}
                      >
                        {isExpired ? "Expired" : "Study Now"}
                      </Button>
                      
                      <Tooltip title="Unenroll">
                        <IconButton
                          color="error"
                          onClick={() => handleUnenroll(item._id)}
                          sx={{ border: "1px solid #eaeaea", borderRadius: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}

export default MyCourses;