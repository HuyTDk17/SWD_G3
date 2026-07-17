import { Container, Paper, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
        </Typography>
        <Typography color="text.secondary">
          Welcome back, {user?.fullName}. Your current role is {user?.role}.
        </Typography>
      </Paper>
    </Container>
  );
}

export default StudentDashboardPage;
