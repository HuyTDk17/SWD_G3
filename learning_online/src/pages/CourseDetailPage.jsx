import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Rating,
  Divider,
  Paper,
  Stack,
  TextField
} from "@mui/material";
import { getCourseReviews, submitReview } from "../api/reviewApi";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import { resolveMediaUrl } from "../utils/media";
import ListIcon from "@mui/icons-material/List";
import courseService from "../services/courseService";
import { enrollCourse, getEnrolledCourses } from "../api/enrollmentApi";
import { useAuth } from "../contexts/AuthContext";


function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Reviews state (Step 9 Integration)
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fallback user details for optional endpoint visibility checks
        const result = await courseService.getCourseBySlug(slug);
        setCourse(result);

        // Fetch course reviews
        const reviewsRes = await getCourseReviews(result._id);
        const approvedReviews = reviewsRes.data.data || [];
        setReviews(approvedReviews);
        
        // Verify enrollment
        if (isAuthenticated && user) {
          const res = await getEnrolledCourses();
          const list = res.data || [];
          const enrolled = list.some(item => (item.courseId?._id || item.courseId) === result._id);
          setIsEnrolled(enrolled);

          // Check if already reviewed in the approved list
          const reviewed = approvedReviews.some(r => r.studentId?._id === user.id);
          setHasReviewed(reviewed);
        }
      } catch (err) {
        console.error(err);
        setError("Course not found or insufficient permissions.");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [slug, isAuthenticated, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      alert("Please enter a comment for your review.");
      return;
    }
    try {
      setReviewSubmitting(true);
      await submitReview(course._id, { rating: reviewRating, comment: reviewComment });
      alert("Review submitted successfully! It is pending administrator approval.");
      setHasReviewed(true);
      setReviewComment("");
    } catch (err) {
      alert("Failed to submit review: " + (err.response?.data?.message || err.message));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      if (window.confirm("You need to login to enroll. Go to login page?")) {
        navigate("/login");
      }
      return;
    }

    try {
      setEnrolling(true);
      await enrollCourse(course._id);
      alert("Enrolled successfully!");
      navigate("/my-courses");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Enrollment failed. Please try again.";
      alert(msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading course details...</Typography>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", bgcolor: "#ffebee", p: 4, borderRadius: 3 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || "An error occurred"}
          </Typography>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
            Back to Catalog
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{ mb: 3 }}
      >
        Back to Catalog
      </Button>

      <Grid container spacing={4}>
        {/* Main Content (Left) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
              {course.title}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip label={course.category} color="primary" />
              <Chip label={`Language: ${course.language}`} variant="outlined" />
              <Chip label={`CEFR: ${course.cefrLevel}`} variant="outlined" color="secondary" />
              {course.status !== "published" && (
                <Chip label={`Status: ${course.status.toUpperCase()}`} color="warning" />
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Rating value={course.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {course.averageRating ? course.averageRating.toFixed(1) : "No ratings yet"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({course.reviewCount || 0} reviews)
              </Typography>
            </Box>
          </Box>

          <Paper sx={{ p: 4, borderRadius: 3, mb: 4, boxShadow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Course Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
              {course.description}
            </Typography>
          </Paper>

          {course.rejectionReason && (
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: "#fff8e1", borderLeft: "5px solid #ffb300" }}>
              <Typography variant="h6" color="warning.dark" sx={{ fontWeight: 700, mb: 1 }}>
                Admin Feedback (Rejection Reason)
              </Typography>
              <Typography variant="body1">{course.rejectionReason}</Typography>
            </Paper>
          )}

          {/* Reviews List Section (Step 9) */}
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4, boxShadow: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Course Reviews & Ratings
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Rating value={course.averageRating || 0} precision={0.1} readOnly />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {course.averageRating || 0} ({course.reviewCount || 0} reviews)
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {reviews.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No approved reviews for this course yet.
              </Typography>
            ) : (
              <Stack spacing={3}>
                {reviews.map((r) => (
                  <Box key={r._id} sx={{ pb: 3, borderBottom: "1px solid #eaeaea", "&:last-child": { borderBottom: 0 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {r.studentId?.name || "Student"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Rating value={r.rating} readOnly size="small" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {r.comment}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Submit Review Form (Step 9) */}
          {isEnrolled && !hasReviewed && (
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4, boxShadow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Write a Review
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Share your learning experience with other students. Reviews are moderated by administrators before posting.
              </Typography>

              <Box component="form" onSubmit={handleReviewSubmit} noValidate>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Your Rating:
                  </Typography>
                  <Rating
                    value={reviewRating}
                    onChange={(event, newValue) => setReviewRating(newValue)}
                    size="large"
                  />
                </Box>

                <TextField
                  label="Your Review/Comment"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike about this course?"
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={reviewSubmitting}
                  sx={{ py: 1, px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Sidebar Panel (Right) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3, position: "sticky", top: 20 }}>
            <Box
              component="img"
              src={resolveMediaUrl(course.thumbnailAssetId?.url || course.image) || "https://via.placeholder.com/400x220?text=No+Thumbnail"}
              alt={course.title}
              sx={{ width: "100%", height: 220, objectFit: "cover" }}
            />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 2 }}>
                {course.price === 0 ? "Free" : `$${course.price}`}
              </Typography>

              {isEnrolled ? (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  onClick={() => navigate(`/courses/${course.slug}/play`)}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mb: 3 }}
                >
                  Go to Lesson Player
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={enrolling || course.status !== "published"}
                  onClick={handleEnroll}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mb: 3 }}
                >
                  {enrolling ? "Enrolling..." : course.status === "published" ? "Enroll Now" : "Not Available"}
                </Button>
              )}

              <Divider sx={{ mb: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                This Course Includes:
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ListIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>{course.lessonCount || 0}</strong> Lessons
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <GroupIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Capacity: <strong>{course.capacity !== null ? `${course.enrollmentCount || 0}/${course.capacity}` : "Unlimited"}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <EventIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Duration: <strong>{course.durationDays !== null ? `${course.durationDays} days` : "Self-paced"}</strong>
                  </Typography>
                </Box>

                {course.teacherId && (
                  <Box sx={{ mt: 1 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Instructor:</strong>
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        component="img"
                        src={course.teacherId.avatar || "https://via.placeholder.com/40?text=Avatar"}
                        sx={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.teacherId.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.teacherId.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CourseDetailPage;
