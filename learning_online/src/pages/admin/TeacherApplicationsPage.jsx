import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import userService from '../../services/userService';

function TeacherApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [review, setReview] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await userService.listTeacherApplications();
        if (active) setApplications(result.items);
      } catch (err) {
        if (active) setError(userService.getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const submitReview = async (decision) => {
    setSaving(true);
    setError('');
    try {
      const updated = await userService.reviewTeacherApplication(review._id, {
        decision,
        adminFeedback: feedback
      });
      setApplications((items) => items.map((item) => item._id === updated._id ? updated : item));
      setReview(null);
      setFeedback('');
    } catch (err) {
      setError(userService.getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label="Loading teacher applications" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>Teacher applications</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!applications.length && <Alert severity="info">No teacher applications found.</Alert>}
      <Stack spacing={2}>
        {applications.map((application) => (
          <Paper key={application._id} sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="h6">{application.userId?.fullName}</Typography>
                <Typography color="text.secondary">{application.userId?.email}</Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Languages:</strong> {application.languagesTaught.join(', ')}
                </Typography>
                <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{application.credentials}</Typography>
              </Box>
              <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
                <Chip label={application.status} size="small" />
                {application.status === 'pending' && (
                  <Button variant="contained" onClick={() => setReview(application)}>
                    Review
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Dialog open={Boolean(review)} onClose={() => setReview(null)} fullWidth maxWidth="sm">
        <DialogTitle>Review teacher application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Admin feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            multiline
            minRows={3}
            fullWidth
            sx={{ mt: 1 }}
            helperText="Required when rejecting."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReview(null)}>Cancel</Button>
          <Button color="error" onClick={() => submitReview('rejected')} disabled={saving || !feedback.trim()}>
            Reject
          </Button>
          <Button variant="contained" onClick={() => submitReview('approved')} disabled={saving}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeacherApplicationsPage;
