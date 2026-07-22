import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
import AddIcon from "@mui/icons-material/Add";
import { resolveMediaUrl } from "../../utils/media";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import ArchiveIcon from "@mui/icons-material/Archive";
import SendIcon from "@mui/icons-material/Send";
import ListIcon from "@mui/icons-material/List";
import courseService from "../../services/courseService";
import { useAuth } from "../../contexts/AuthContext";

function TeacherCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Query courses created by this teacher
      const result = await courseService.getCourses({
        teacherId: user?.id,
        sortBy: "createdAt_desc"
      });
      setCourses(result.items || []);
    } catch (err) {
      console.error(err);
      setError(courseService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => loadCourses());
    }
  }, [user]);

  const handleSubmitForApproval = async (id) => {
    try {
      await courseService.submitCourse(id);
      alert("Submitted for admin approval!");
      loadCourses();
    } catch (err) {
      alert(courseService.getErrorMessage(err));
    }
  };

  const handlePublish = async (id) => {
    try {
      await courseService.publishCourse(id);
      alert("Course published successfully!");
      loadCourses();
    } catch (err) {
      alert(courseService.getErrorMessage(err));
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this course? It will be hidden from the catalog.")) return;
    try {
      await courseService.archiveCourse(id);
      alert("Course archived!");
      loadCourses();
    } catch (err) {
      alert(courseService.getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course permanently?")) return;
    try {
      await courseService.deleteCourse(id);
      alert("Course deleted successfully!");
      loadCourses();
    } catch (err) {
      alert(courseService.getErrorMessage(err));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published": return "success";
      case "approved": return "info";
      case "pending_approval": return "warning";
      case "rejected": return "error";
      case "archived": return "default";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading your courses...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          My Created Courses
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/teacher/courses/new"
          sx={{ borderRadius: 2 }}
        >
          Create Course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You haven't created any courses yet.
          </Typography>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/teacher/courses/new"
            startIcon={<AddIcon />}
          >
            Create Your First Course
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Lessons</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        component="img"
                        src={resolveMediaUrl(course.thumbnailAssetId?.url || course.image) || "https://via.placeholder.com/80x45?text=No+Img"}
                        sx={{ width: 80, height: 45, borderRadius: 1, objectFit: "cover" }}
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.language} • {course.cefrLevel}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.price === 0 ? "Free" : `$${course.price}`}</TableCell>
                  <TableCell>{course.lessonCount || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={course.status.replace("_", " ").toUpperCase()}
                      color={getStatusColor(course.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    {course.status === "rejected" && course.rejectionReason && (
                      <Typography variant="caption" display="block" color="error" sx={{ mt: 0.5 }}>
                        Reason: {course.rejectionReason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      {/* Submit */}
                      {(course.status === "draft" || course.status === "rejected") && (
                        <Tooltip title="Submit for Approval (needs >= 3 lessons)">
                          <IconButton
                            color="warning"
                            size="small"
                            onClick={() => handleSubmitForApproval(course._id)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Publish */}
                      {course.status === "approved" && (
                        <Tooltip title="Publish Course">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handlePublish(course._id)}
                          >
                            <PublishIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Archive */}
                      {course.status === "published" && (
                        <Tooltip title="Archive Course">
                          <IconButton
                            color="default"
                            size="small"
                            onClick={() => handleArchive(course._id)}
                          >
                            <ArchiveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Curriculum */}
                      <Tooltip title="Manage Curriculum (Lessons)">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => navigate(`/teacher/courses/${course._id}/lessons`)}
                        >
                          <ListIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Edit */}
                      <Tooltip title="Edit Course">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/teacher/courses/edit/${course._id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Delete */}
                      {(course.status === "draft" || course.status === "rejected") && (
                        <Tooltip title="Delete Course">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(course._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
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

export default TeacherCoursesPage;
