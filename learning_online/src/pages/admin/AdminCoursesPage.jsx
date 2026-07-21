import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import courseService from "../../services/courseService";
import { resolveMediaUrl } from "../../utils/media";

function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state for rejection feedback
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const loadPendingCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await courseService.getCourses({ status: "pending_approval" });
      setCourses(result.items || []);
    } catch (err) {
      console.error(err);
      setError(courseService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCourses();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this course?")) return;
    try {
      await courseService.approveCourse(id);
      alert("Course approved successfully!");
      loadPendingCourses();
    } catch (err) {
      alert(courseService.getErrorMessage(err));
    }
  };

  const handleOpenReject = (id) => {
    setSelectedCourseId(id);
    setRejectionReason("");
    setRejectError("");
    setOpenRejectDialog(true);
  };

  const handleCloseReject = () => {
    setOpenRejectDialog(false);
    setSelectedCourseId(null);
    setRejectionReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }

    try {
      setRejecting(true);
      setRejectError("");
      await courseService.rejectCourse(selectedCourseId, rejectionReason);
      alert("Course rejected and feedback sent.");
      handleCloseReject();
      loadPendingCourses();
    } catch (err) {
      setRejectError(courseService.getErrorMessage(err));
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading pending approvals...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
        Course Approvals Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No courses are currently pending approval.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Lessons</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.teacherId?.fullName || "Unknown"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.teacherId?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.price === 0 ? "Free" : `$${course.price}`}</TableCell>
                  <TableCell>{course.lessonCount || 0}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="primary"
                          size="small"
                          component={RouterLink}
                          to={`/courses/${course.slug}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Approve Course">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleApprove(course._id)}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Reject Course">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenReject(course._id)}
                        >
                          <CloseIcon fontSize="small" />
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

      {/* Reject dialog */}
      <Dialog open={openRejectDialog} onClose={handleCloseReject} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Course Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a specific reason for rejection. This feedback will be displayed to the teacher.
          </Typography>

          {rejectError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {rejectError}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseReject} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRejectSubmit}
            variant="contained"
            color="error"
            disabled={rejecting}
          >
            {rejecting ? "Rejecting..." : "Submit Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminCoursesPage;
