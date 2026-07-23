import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

function VerifyOtpPage() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await verifyOtp({ email, otp });
      setMessage('Email verified successfully. You can now login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await resendOtp({ email });
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(authService.getErrorMessage(err));
    }
  };

  return (
    <Box component="form" onSubmit={handleVerify}>
      <Typography variant="h6" gutterBottom>Verify email</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        We've sent a 6-digit code to your email. Enter it below to verify your account.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Stack spacing={2}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          inputProps={{ maxLength: 6 }}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={submitting} fullWidth>
          {submitting ? 'Verifying...' : 'Verify OTP'}
        </Button>
        <Button variant="outlined" onClick={handleResend} fullWidth>
          Resend OTP
        </Button>
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/login" underline="hover">
          Back to login
        </Link>
      </Box>
    </Box>
  );
}

export default VerifyOtpPage;
