import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MediaUpload from '../components/media/MediaUpload';
import userService from '../services/userService';

function TeacherApplicationPage() {
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({
    credentials: '',
    languagesTaught: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadApplication = async () => {
      try {
        const data = await userService.getMyTeacherApplication();
        if (active) setApplication(data);
      } catch (err) {
        if (active) setError(userService.getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadApplication();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = await userService.submitTeacherApplication({
        credentials: form.credentials,
        languagesTaught: form.languagesTaught.split(',').map((item) => item.trim()).filter(Boolean),
        documentAssetIds: documents.map((doc) => doc.id)
      });
      setApplication(data);
    } catch (err) {
      setError(userService.getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label="Loading application" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Become a teacher</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Submit your qualifications for admin review. Complete your profile, bio and avatar first.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {application ? (
          <Stack spacing={2}>
            <Box>
              Status:{' '}
              <Chip
                label={application.status}
                color={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'error' : 'warning'}
                size="small"
              />
            </Box>
            <Typography><strong>Languages:</strong> {application.languagesTaught.join(', ')}</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{application.credentials}</Typography>
            {application.documentAssetIds?.length > 0 && (
              <Typography>
                <strong>Documents:</strong> {application.documentAssetIds.length} PDF file(s) attached
              </Typography>
            )}
            {application.adminFeedback && (
              <Alert severity={application.status === 'rejected' ? 'error' : 'info'}>
                Admin feedback: {application.adminFeedback}
              </Alert>
            )}
          </Stack>
        ) : (
          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <TextField
              label="Qualifications and teaching experience"
              name="credentials"
              value={form.credentials}
              onChange={handleChange}
              multiline
              minRows={5}
              required
              helperText="Minimum 20 characters."
            />
            <TextField
              label="Languages you teach"
              name="languagesTaught"
              value={form.languagesTaught}
              onChange={handleChange}
              required
              helperText="Separate languages with commas."
            />
            <MediaUpload
              label="Credential documents (PDF)"
              purpose="credential"
              accept="application/pdf"
              assetType="pdf"
              multiple
              values={documents}
              onValuesChange={setDocuments}
              helperText="Optional. Upload teaching certificates or credentials as PDF files."
            />
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit application'}
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}

export default TeacherApplicationPage;
