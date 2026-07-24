import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    try {
      await googleLogin(credential);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(authService.getErrorMessage(err));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Create account</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <TextField
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          required
          fullWidth
          helperText="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />
        <Button type="submit" variant="contained" disabled={submitting} fullWidth>
          {submitting ? 'Creating account...' : 'Register'}
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }}>OR</Divider>
      <GoogleSignInButton
        text="signup_with"
        onSuccess={handleGoogleSuccess}
        onError={(err) => setError(err.message)}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default RegisterPage;
