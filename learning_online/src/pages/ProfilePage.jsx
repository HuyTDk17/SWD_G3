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
  Typography
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MediaUpload from '../components/media/MediaUpload';
import userService from '../services/userService';

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
      setProfile(data);
      updateUser(data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(userService.getErrorMessage(err));
    } finally {
      setSaving(false);
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
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ProfilePage;
