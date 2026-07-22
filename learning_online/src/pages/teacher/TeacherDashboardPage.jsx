import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import BookIcon from "@mui/icons-material/Book";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getTeacherDashboard } from "../../api/dashboardApi";

function TeacherDashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await getTeacherDashboard();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load teacher analytics.");
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
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard statistics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Teacher Dashboard
        </Typography>
        <Typography color="text.secondary">
          Track student enrollments, course ratings, and evaluate assessment responses.
        </Typography>
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
                  <PeopleIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Active Students</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.totalStudentsEnrolled}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "success.light", color: "success.main", borderRadius: 2 }}>
                  <BookIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Published Courses</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.activeCourses}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "warning.light", color: "warning.main", borderRadius: 2 }}>
                  <StarIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Average Rating</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.averageRating} ★</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "error.light", color: "error.main", borderRadius: 2 }}>
                  <BookIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Total Taught</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.totalCourses}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Submissions Section */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Recent Student Quiz Submissions
      </Typography>

      {stats && stats.recentSubmissions?.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <Typography color="text.secondary">
            No quiz submissions received from students yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Quiz Title</TableCell>
                <TableCell>Score (%)</TableCell>
                <TableCell>Grading State</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats && stats.recentSubmissions?.map((sub) => (
                <TableRow key={sub._id} hover>
                  <TableCell>
                    {sub.studentId?.fullName || sub.studentId?.name || "Student"}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {sub.studentId?.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {sub.quizId?.title}
                  </TableCell>
                  <TableCell>
                    {sub.score}%
                  </TableCell>
                  <TableCell>
                    {sub.gradingStatus}
                  </TableCell>
                  <TableCell>
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => navigate(`/courses/edit/quizzes/${sub.quizId?._id}/results/${sub._id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default TeacherDashboardPage;
