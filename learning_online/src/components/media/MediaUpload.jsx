import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Stack,
  Typography
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import mediaService from '../../services/mediaService';

function MediaUpload({
  label,
  purpose,
  accept,
  assetType = 'image',
  multiple = false,
  value = null,
  values = [],
  onChange,
  onValuesChange,
  disabled = false,
  helperText = ''
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const data = await mediaService.getConfig();
        if (active) setConfig(data);
      } catch (err) {
        if (active) setError(mediaService.getErrorMessage(err));
      }
    };
    loadConfig();
    return () => {
      active = false;
    };
  }, []);

  const handleSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      if (multiple) {
        const uploaded = [];
        for (const file of files) {
          const asset = await mediaService.upload({
            file,
            purpose,
            onProgress: setProgress
          });
          uploaded.push(asset);
        }
        onValuesChange?.([...(values || []), ...uploaded]);
      } else {
        const asset = await mediaService.upload({
          file: files[0],
          purpose,
          onProgress: setProgress
        });
        onChange?.(asset);
      }
    } catch (err) {
      setError(mediaService.getErrorMessage(err));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveSingle = async () => {
    if (!value?.id) {
      onChange?.(null);
      return;
    }
    setError('');
    try {
      await mediaService.remove(value.id);
      onChange?.(null);
    } catch (err) {
      setError(mediaService.getErrorMessage(err));
    }
  };

  const handleRemoveMultiple = async (assetId) => {
    setError('');
    try {
      await mediaService.remove(assetId);
      onValuesChange?.((values || []).filter((item) => item.id !== assetId));
    } catch (err) {
      setError(mediaService.getErrorMessage(err));
    }
  };

  const renderSinglePreview = () => {
    if (!value) return null;
    if (assetType === 'image') {
      return (
        <Box
          component="img"
          src={value.url}
          alt={value.originalName}
          sx={{ width: 96, height: 96, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
        />
      );
    }
    return (
      <Typography variant="body2">
        {value.originalName} ({mediaService.formatFileSize(value.sizeBytes)})
      </Typography>
    );
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>
      {helperText && <Typography variant="caption" color="text.secondary">{helperText}</Typography>}
      {config && (
        <Typography variant="caption" color="text.secondary">
          Provider: {config.provider}
          {assetType === 'image' ? ' • Max 10 MB' : ' • Max 20 MB'}
        </Typography>
      )}

      {!multiple && value && (
        <Stack direction="row" spacing={2} alignItems="center">
          {renderSinglePreview()}
          <IconButton onClick={handleRemoveSingle} disabled={disabled || uploading} aria-label="Remove file">
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Stack>
      )}

      {multiple && (values || []).map((asset) => (
        <Stack key={asset.id} direction="row" spacing={1} alignItems="center">
          <UploadFileIcon fontSize="small" color="action" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2">{asset.originalName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {mediaService.formatFileSize(asset.sizeBytes)}
            </Typography>
          </Box>
          <IconButton
            onClick={() => handleRemoveMultiple(asset.id)}
            disabled={disabled || uploading}
            aria-label={`Remove ${asset.originalName}`}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Stack>
      ))}

      {uploading && (
        <Box>
          <LinearProgress variant={progress ? 'determinate' : 'indeterminate'} value={progress} />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption">Uploading...</Typography>
          </Stack>
        </Box>
      )}

      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
        disabled={disabled || uploading}
      >
        {multiple ? 'Add files' : value ? 'Replace file' : 'Choose file'}
        <input
          ref={inputRef}
          hidden
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleSelect}
        />
      </Button>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}

export default MediaUpload;
