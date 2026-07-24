import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MediaUpload from '../components/media/MediaUpload';
import userService from '../services/userService';
import { getPreferences, updatePreferences } from '../api/notificationApi';

function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [avatarAsset, setAvatarAsset] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Notification settings states (Step 11)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Change password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getMe();
        setProfile(data);
        setForm({
          fullName: data.fullName || '',
          bio: data.bio || '',
          nativeLanguage: data.nativeLanguage || '',
          targetLanguages: (data.targetLanguages || []).join(', '),
          timezone: data.timezone || ''
        });
        if (data.avatarAssetId && data.avatar) {
          setAvatarAsset({
            id: data.avatarAssetId,
            url: data.avatar,
            originalName: 'avatar',
            sizeBytes: 0
          });
        }

        // Fetch notification settings
        const prefRes = await getPreferences();
        setEmailAlerts(prefRes.data.data.emailAlerts);
        setSystemAlerts(prefRes.data.data.systemAlerts);
      } catch (err) {
        setError(userService.getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleAvatarUpload = async (asset) => {
    if (!asset) {
      setAvatarAsset(null);
      return;
    }
    setSavingAvatar(true);
    setError('');
    setMessage('');
    try {
      const data = await userService.setAvatar(asset.id);
      setProfile(data);
      updateUser(data);
      setAvatarAsset({
        id: data.avatarAssetId,
        url: data.avatar,
        originalName: asset.originalName,
        sizeBytes: asset.sizeBytes
      });
      setMessage('Avatar updated successfully.');
    } catch (err) {
      setError(userService.getErrorMessage(err));
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await userService.updateMe({
        ...form,
        targetLanguages: form.targetLanguages
          .split(',')
          .map((language) => language.trim())
          .filter(Boolean)
      });

      // Save notification preferences
      await updatePreferences({ emailAlerts, systemAlerts });

      setProfile(data);
      updateUser(data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(userService.getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPwError('');
    setPwMessage('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setPwSaving(true);
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwMessage('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(userService.getErrorMessage(err));
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profile) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 4, px: 2 }}>
      {profile?.role === 'student' && (
        <Button
          component={RouterLink}
          to="/my-certificates"
          variant="contained"
          color="secondary"
          sx={{ mb: 3, borderRadius: 2, fontWeight: 700 }}
        >
          View My Earned Certificates
        </Button>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>My profile</Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          <Typography color="text.secondary">{profile.email}</Typography>
          <Box>
            <strong>Role:</strong>{' '}
            <Chip label={profile.role} size="small" color="primary" sx={{ ml: 1 }} />
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={avatarAsset?.url || profile.avatar || undefined} sx={{ width: 72, height: 72 }} />
            <Box sx={{ flex: 1 }}>
              <MediaUpload
                label="Profile photo"
                purpose="avatar"
                accept="image/jpeg,image/png,image/webp,image/gif"
                assetType="image"
                value={avatarAsset}
                onChange={handleAvatarUpload}
                disabled={savingAvatar}
                helperText="Upload a square image for your profile. Saved automatically after upload."
              />
            </Box>
          </Stack>
          <TextField
            label="Full name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            multiline
            minRows={3}
            helperText="Required before applying to become a teacher."
          />
          <TextField
            label="Native language"
            name="nativeLanguage"
            value={form.nativeLanguage}
            onChange={handleChange}
          />
          <TextField
            label="Target languages"
            name="targetLanguages"
            value={form.targetLanguages}
            onChange={handleChange}
            helperText="Separate languages with commas."
          />
          <TextField
            label="Timezone"
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
            placeholder="Asia/Ho_Chi_Minh"
          />

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Notification Preferences
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={systemAlerts}
                onChange={(e) => setSystemAlerts(e.target.checked)}
              />
            }
            label="In-app System Alerts (Bell Notifications)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            }
            label="Email Alerts (SMTP Dispatches)"
          />

          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </Stack>
      </Paper>

      <Paper component="form" onSubmit={handlePasswordChange} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Change password</Typography>
        <Stack spacing={2}>
          {pwError && <Alert severity="error">{pwError}</Alert>}
          {pwMessage && <Alert severity="success">{pwMessage}</Alert>}
          <TextField
            label="Current password"
            type={showCurrentPw ? 'text' : 'password'}
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPw((v) => !v)} edge="end">
                      {showCurrentPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          <TextField
            label="New password"
            type={showNewPw ? 'text' : 'password'}
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
            helperText="Minimum 8 characters."
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPw((v) => !v)} edge="end">
                      {showNewPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          <TextField
            label="Confirm new password"
            type={showConfirmPw ? 'text' : 'password'}
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPw((v) => !v)} edge="end">
                      {showConfirmPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          <Button type="submit" variant="contained" disabled={pwSaving}>
            {pwSaving ? 'Updating...' : 'Update password'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ProfilePage;
