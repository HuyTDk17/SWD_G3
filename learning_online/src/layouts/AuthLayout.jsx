import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Paper, Typography, Link } from '@mui/material';

function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
            Language Learning Platform
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in or create an account to continue learning.
          </Typography>
          <Outlet />
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link component={RouterLink} to="/" underline="hover">
              Back to course catalog
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;
