import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Divider,
  CircularProgress,
  Chip,
  Alert
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChatIcon from "@mui/icons-material/Chat";
import { getStudentDashboard } from "../api/dashboardApi";
import { useAuth } from "../contexts/AuthContext";

function StudentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === "teacher") {
      navigate("/teacher/dashboard", { replace: true });
    } else if (user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await getStudentDashboard();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Top Banner section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Welcome Back, {user?.fullName}!
          </Typography>
          <Typography color="text.secondary">
            Keep practicing and learning to build up your language vocabulary.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/ai-assistant"
          variant="contained"
          color="secondary"
          startIcon={<ChatIcon />}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Practice with AI Assistant
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "primary.light", color: "primary.main", borderRadius: 2 }}>
                  <SchoolIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Active Courses</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.activeCourses}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "success.light", color: "success.main", borderRadius: 2 }}>
                  <SpeedIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Avg Completion</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.completionPercent}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "error.light", color: "error.main", borderRadius: 2 }}>
                  <LocalFireDepartmentIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Streak Counter</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.currentStreak} Days</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "warning.light", color: "warning.main", borderRadius: 2 }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Certs Earned</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.certificatesEarned}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Student enrolled courses feed list */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        My Enrolled Courses Progress
      </Typography>
      
      {stats && stats.recentCourses?.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You are not enrolled in any language courses yet.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Explore Course Catalog
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {stats && stats.recentCourses?.map((course) => (
            <Grid size={{ xs: 12, md: 6 }} key={course._id}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {course.title}
                    </Typography>
                    <Chip label={course.cefrLevel} size="small" color="primary" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                    Language: {course.language}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Progress</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{course.completionPercent}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={course.completionPercent} sx={{ height: 6, borderRadius: 2 }} />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    {course.lessonsCompleted} / {course.totalLessons} Lessons done
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => navigate(`/courses/${course.slug}/play`)}
                  >
                    Resume
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default StudentDashboardPage;
