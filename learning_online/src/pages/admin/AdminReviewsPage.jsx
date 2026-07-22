import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Rating,
  Alert,
  Tooltip
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { getPendingReviews, moderateReview } from "../../api/reviewApi";

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moderatingId, setModeratingId] = useState(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPendingReviews();
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load pending reviews for moderation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadPending());
  }, []);

  const handleModerate = async (reviewId, status) => {
    try {
      setModeratingId(reviewId);
      await moderateReview(reviewId, status);
      alert(`Review has been successfully ${status}!`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Failed to moderate review: " + (err.response?.data?.message || err.message));
    } finally {
      setModeratingId(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading pending reviews queue...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Review Moderation Queue
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Approve or reject student course ratings and comments. Approved reviews calculate into the overall course rating.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {reviews.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No reviews pending moderation. Good job!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {r.courseId?.title}
                    <Typography variant="caption" display="block" color="text.secondary">
                      Language: {r.courseId?.language}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {r.studentId?.name || "Student"}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {r.studentId?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Rating value={r.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, wordWrap: "break-word" }}>
                    {r.comment || <em>No comment provided.</em>}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Tooltip title="Approve Review">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          disabled={moderatingId === r._id}
                          onClick={() => handleModerate(r._id, "approved")}
                          sx={{ borderRadius: 2 }}
                        >
                          Approve
                        </Button>
                      </Tooltip>

                      <Tooltip title="Reject Review">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          disabled={moderatingId === r._id}
                          onClick={() => handleModerate(r._id, "rejected")}
                          sx={{ borderRadius: 2 }}
                        >
                          Reject
                        </Button>
                      </Tooltip>
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

export default AdminReviewsPage;
