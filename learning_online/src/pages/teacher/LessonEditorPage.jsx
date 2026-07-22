import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Grid,
  Stack,
  Alert,
  IconButton,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import lessonService from "../../services/lessonService";
import MediaUpload from "../../components/media/MediaUpload";

function LessonEditorPage() {
  const { courseId, id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    estimatedMinutes: 15,
    status: "draft",
    contentType: ["text"], // Array of string
    textContent: "",
    grammarNotes: "",
    videoAssetId: "",
    audioAssetId: "",
    resourceAssetIds: [],
    vocabulary: [] // [{ word, translation, pronunciation }]
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Media state
  const [videoAsset, setVideoAsset] = useState(null);
  const [audioAsset, setAudioAsset] = useState(null);
  const [resourceAssets, setResourceAssets] = useState([]);

  // Temp vocabulary item state
  const [newVocab, setNewVocab] = useState({ word: "", translation: "", pronunciation: "" });

  useEffect(() => {
    if (isEditMode) {
      const loadLesson = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await lessonService.getLessonById(courseId, id);
          
          setForm({
            title: data.title || "",
            description: data.description || "",
            estimatedMinutes: data.estimatedMinutes ?? 15,
            status: data.status || "draft",
            contentType: data.contentType || ["text"],
            textContent: data.textContent || "",
            grammarNotes: data.grammarNotes || "",
            videoAssetId: data.videoAssetId?._id || data.videoAssetId || "",
            audioAssetId: data.audioAssetId?._id || data.audioAssetId || "",
            resourceAssetIds: (data.resourceAssetIds || []).map(r => r._id || r),
            vocabulary: data.vocabulary || []
          });

          if (data.videoAssetId) {
            setVideoAsset({
              id: data.videoAssetId._id || data.videoAssetId,
              url: data.videoAssetId.url || "",
              originalName: data.videoAssetId.originalName || "video_file",
              sizeBytes: 0
            });
          }

          if (data.audioAssetId) {
            setAudioAsset({
              id: data.audioAssetId._id || data.audioAssetId,
              url: data.audioAssetId.url || "",
              originalName: data.audioAssetId.originalName || "audio_file",
              sizeBytes: 0
            });
          }

          if (data.resourceAssetIds && data.resourceAssetIds.length > 0) {
            setResourceAssets(data.resourceAssetIds.map(r => ({
              id: r._id || r,
              url: r.url || "",
              originalName: r.originalName || "resource_file",
              sizeBytes: 0
            })));
          }
        } catch (err) {
          console.error(err);
          setError("Failed to load lesson details.");
        } finally {
          setLoading(false);
        }
      };
      loadLesson();
    }
  }, [courseId, id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setForm((prev) => {
      const types = prev.contentType.includes(type)
        ? prev.contentType.filter((t) => t !== type)
        : [...prev.contentType, type];
      // Default to text if empty
      return { ...prev, contentType: types.length === 0 ? ["text"] : types };
    });
  };

  const handleAddVocab = () => {
    if (!newVocab.word.trim() || !newVocab.translation.trim()) {
      alert("Word and translation are required!");
      return;
    }
    setForm((prev) => ({
      ...prev,
      vocabulary: [...prev.vocabulary, { ...newVocab }]
    }));
    setNewVocab({ word: "", translation: "", pronunciation: "" });
  };

  const handleRemoveVocab = (index) => {
    setForm((prev) => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, idx) => idx !== index)
    }));
  };

  const handleVideoUploadChange = (asset) => {
    setVideoAsset(asset);
    setForm((prev) => ({ ...prev, videoAssetId: asset ? asset.id : "" }));
  };

  const handleAudioUploadChange = (asset) => {
    setAudioAsset(asset);
    setForm((prev) => ({ ...prev, audioAssetId: asset ? asset.id : "" }));
  };

  const handleResourceUploadsChange = (assets) => {
    setResourceAssets(assets);
    setForm((prev) => ({ ...prev, resourceAssetIds: assets.map(a => a.id) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...form,
        estimatedMinutes: Number(form.estimatedMinutes),
        videoAssetId: form.videoAssetId || null,
        audioAssetId: form.audioAssetId || null,
        resourceAssetIds: form.resourceAssetIds
      };

      if (isEditMode) {
        await lessonService.updateLesson(courseId, id, payload);
        alert("Lesson updated successfully!");
      } else {
        await lessonService.createLesson(courseId, payload);
        alert("Lesson created successfully!");
      }

      navigate(`/teacher/courses/${courseId}/lessons`);
    } catch (err) {
      console.error(err);
      setError(lessonService.getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading lesson details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/teacher/courses/${courseId}/lessons`)}
        sx={{ mb: 3 }}
      >
        Back to Curriculum
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
          {isEditMode ? "Edit Lesson" : "Create New Lesson"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                name="title"
                label="Lesson Title"
                fullWidth
                required
                value={form.title}
                onChange={handleChange}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                name="description"
                label="Brief Summary/Description"
                fullWidth
                multiline
                rows={2}
                value={form.description}
                onChange={handleChange}
              />
            </Grid>

            {/* Estimated Minutes & Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="estimatedMinutes"
                label="Estimated Duration (minutes)"
                type="number"
                fullWidth
                required
                inputProps={{ min: 1 }}
                value={form.estimatedMinutes}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="status"
                label="Publication Status"
                fullWidth
                value={form.status}
                onChange={handleChange}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>
            </Grid>

            {/* Content Types Checkboxes */}
            <Grid size={{ xs: 12 }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                Lesson Content Sections
              </FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={form.contentType.includes("text")} onChange={() => handleTypeChange("text")} />}
                  label="Text/Instructions"
                />
                <FormControlLabel
                  control={<Checkbox checked={form.contentType.includes("vocabulary")} onChange={() => handleTypeChange("vocabulary")} />}
                  label="Vocabulary Builder"
                />
                <FormControlLabel
                  control={<Checkbox checked={form.contentType.includes("grammar")} onChange={() => handleTypeChange("grammar")} />}
                  label="Grammar Notes"
                />
                <FormControlLabel
                  control={<Checkbox checked={form.contentType.includes("video")} onChange={() => handleTypeChange("video")} />}
                  label="Video Player"
                />
                <FormControlLabel
                  control={<Checkbox checked={form.contentType.includes("audio")} onChange={() => handleTypeChange("audio")} />}
                  label="Audio Player"
                />
              </FormGroup>
            </Grid>

            {/* Conditional Rich Text Area */}
            {form.contentType.includes("text") && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="textContent"
                  label="Rich Text Instruction (Markdown supported)"
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Explain concepts or write lesson instructions here..."
                  value={form.textContent}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {/* Conditional Grammar Notes */}
            {form.contentType.includes("grammar") && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="grammarNotes"
                  label="Grammar Notes"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Explain grammar rules, sentence structures, conjugation, etc..."
                  value={form.grammarNotes}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {/* Conditional Video / Audio Uploads */}
            {form.contentType.includes("video") && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ border: "1px dashed #ccc", p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Video Attachment
                  </Typography>
                  <MediaUpload
                    purpose="general"
                    assetType="image" // Verify owned asset as image format for demo, or support other files
                    value={videoAsset}
                    onChange={handleVideoUploadChange}
                    helperText="Upload a video file (or demo image link)"
                  />
                </Box>
              </Grid>
            )}

            {form.contentType.includes("audio") && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ border: "1px dashed #ccc", p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Audio Attachment
                  </Typography>
                  <MediaUpload
                    purpose="general"
                    assetType="image"
                    value={audioAsset}
                    onChange={handleAudioUploadChange}
                    helperText="Upload an audio file (or demo image link)"
                  />
                </Box>
              </Grid>
            )}

            {/* Resource Files (PDF) */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ border: "1px dashed #ccc", p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Supplemental Resources (PDF)
                </Typography>
                <MediaUpload
                  purpose="general"
                  assetType="pdf"
                  multiple={true}
                  values={resourceAssets}
                  onValuesChange={handleResourceUploadsChange}
                  helperText="Upload study sheets, exercises, etc. (PDF files only)"
                />
              </Box>
            </Grid>

            {/* Conditional Vocabulary List Builder */}
            {form.contentType.includes("vocabulary") && (
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Vocabulary Builder
                </Typography>

                {form.vocabulary.length > 0 && (
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    {form.vocabulary.map((item, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {item.word} {item.pronunciation ? `[${item.pronunciation}]` : ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Meaning: {item.translation}
                          </Typography>
                        </Box>
                        <IconButton color="error" size="small" onClick={() => handleRemoveVocab(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                )}

                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Word/Phrase"
                      size="small"
                      fullWidth
                      value={newVocab.word}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, word: e.target.value }))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Translation"
                      size="small"
                      fullWidth
                      value={newVocab.translation}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, translation: e.target.value }))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Pronunciation"
                      size="small"
                      fullWidth
                      value={newVocab.pronunciation}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, pronunciation: e.target.value }))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 1 }}>
                    <IconButton color="primary" onClick={handleAddVocab}>
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            sx={{ mt: 4, py: 1, px: 4, borderRadius: 2 }}
          >
            {saving ? "Saving..." : "Save Lesson"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LessonEditorPage;
