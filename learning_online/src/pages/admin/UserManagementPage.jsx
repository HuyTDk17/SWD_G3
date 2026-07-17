import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from '@mui/material';
import userService from '../../services/userService';

const statuses = ['active', 'suspended', 'banned', 'deleted'];
const roles = ['student', 'teacher', 'admin'];

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await userService.listUsers();
        if (active) setUsers(result.items);
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

  const updateStatus = async (id, status) => {
    try {
      const updated = await userService.updateUserStatus(id, status);
      setUsers((items) => items.map((item) => item._id === id ? { ...item, status: updated.status } : item));
    } catch (err) {
      setError(userService.getErrorMessage(err));
    }
  };

  const updateRole = async (id, role) => {
    try {
      const updated = await userService.updateUserRole(id, role);
      setUsers((items) => items.map((item) => item._id === id ? { ...item, role: updated.role } : item));
    } catch (err) {
      setError(userService.getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label="Loading users" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>User management</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        {users.map((user) => (
          <Paper key={user._id} sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} gap={2}>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{user.fullName}</Typography>
                <Typography color="text.secondary">{user.email}</Typography>
              </Box>
              <Chip label={user.isEmailVerified ? 'Verified' : 'Unverified'} size="small" />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id={`role-${user._id}`}>Role</InputLabel>
                <Select
                  labelId={`role-${user._id}`}
                  label="Role"
                  value={user.role}
                  onChange={(event) => updateRole(user._id, event.target.value)}
                >
                  {roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id={`status-${user._id}`}>Status</InputLabel>
                <Select
                  labelId={`status-${user._id}`}
                  label="Status"
                  value={user.status}
                  onChange={(event) => updateStatus(user._id, event.target.value)}
                >
                  {statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}

export default UserManagementPage;
