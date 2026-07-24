import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Stack,
  Alert
} from "@mui/material";
import MediaUpload from "../media/MediaUpload";
import { getPublicConfig } from "../../api/configApi";

const LANGUAGES = ["HTML/CSS", "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "SQL", "NoSQL", "Git"];

function CourseForm({ initialData = null, onSubmit, saving, error }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    language: "JavaScript",
    cefrLevel: "A1",
    category: "General",
    price: 0,
    capacity: "",
    durationDays: "",
    isSequential: true,
    lessonCount: 0, // Mock for BR-COURSE-002 testing
    thumbnailAssetId: "",
    image: "" // Display URL
  });

  const [thumbnailAsset, setThumbnailAsset] = useState(null);
  const [cefrLevels, setCefrLevels] = useState(["A1", "A2", "B1", "B2", "C1", "C2"]);
  const [categories, setCategories] = useState(["Programming Fundamentals", "Frontend", "Backend", "Database", "DevOps", "Mobile"]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const res = await getPublicConfig();
        if (res.data.data.cefrLevels?.length) setCefrLevels(res.data.data.cefrLevels);
        if (res.data.data.categories?.length) setCategories(res.data.data.categories);
      } catch (err) {
        console.error("Failed to load category/level options", err);
      }
    };
    Promise.resolve().then(() => loadFilterOptions());
  }, []);

  useEffect(() => {
    const syncFromInitialData = () => {
      if (!initialData) return;
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        language: initialData.language || "JavaScript",
        cefrLevel: initialData.cefrLevel || "A1",
        category: initialData.category || "General",
        price: initialData.price ?? 0,
        capacity: initialData.capacity ?? "",
        durationDays: initialData.durationDays ?? "",
        isSequential: initialData.isSequential ?? true,
        lessonCount: initialData.lessonCount ?? 0,
        thumbnailAssetId: initialData.thumbnailAssetId?._id || initialData.thumbnailAssetId || "",
        image: initialData.image || ""
      });

      if (initialData.thumbnailAssetId) {
        // Standardize thumbnail asset display
        const assetId = initialData.thumbnailAssetId._id || initialData.thumbnailAssetId;
        const assetUrl = initialData.thumbnailAssetId.url || initialData.image || "";
        setThumbnailAsset({
          id: assetId,
          url: assetUrl,
          originalName: "thumbnail",
          sizeBytes: 0
        });
      }
    };

    Promise.resolve().then(syncFromInitialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleThumbnailChange = (asset) => {
    setThumbnailAsset(asset);
    setForm((prev) => ({
      ...prev,
      thumbnailAssetId: asset ? asset.id : "",
      image: asset ? asset.url : ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare payload
    const payload = {
      ...form,
      price: Number(form.price),
      capacity: form.capacity !== "" ? Number(form.capacity) : null,
      durationDays: form.durationDays !== "" ? Number(form.durationDays) : null,
      lessonCount: Number(form.lessonCount),
      thumbnailAssetId: form.thumbnailAssetId || null
    };

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            name="title"
            label="Course Title"
            fullWidth
            required
            value={form.title}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            name="description"
            label="Description"
            fullWidth
            required
            multiline
            rows={4}
            value={form.description}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            name="language"
            label="Language"
            fullWidth
            value={form.language}
            onChange={handleChange}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            name="cefrLevel"
            label="Level"
            fullWidth
            value={form.cefrLevel}
            onChange={handleChange}
          >
            {cefrLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            name="category"
            label="Category"
            fullWidth
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            name="price"
            label="Price ($)"
            type="number"
            fullWidth
            required
            inputProps={{ min: 0, step: 0.01 }}
            value={form.price}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            name="capacity"
            label="Capacity (unlimited if empty)"
            type="number"
            fullWidth
            inputProps={{ min: 1 }}
            value={form.capacity}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            name="durationDays"
            label="Duration (days - optional)"
            type="number"
            fullWidth
            inputProps={{ min: 1 }}
            value={form.durationDays}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="lessonCount"
            label="Mock Lessons Count (At least 3 to submit)"
            type="number"
            fullWidth
            inputProps={{ min: 0 }}
            value={form.lessonCount}
            onChange={handleChange}
            helperText="Temporary mock count to test submit BR-COURSE-002 before Step 5 is built."
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                name="isSequential"
                checked={form.isSequential}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Enforce sequential lesson unlocking"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ border: "1px dashed #ccc", p: 2, borderRadius: 2 }}>
            <MediaUpload
              label="Upload Course Thumbnail"
              purpose="thumbnail"
              assetType="image"
              value={thumbnailAsset}
              onChange={handleThumbnailChange}
              helperText="Upload an image file (PNG/JPG/WEBP)"
            />
          </Box>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving}
          sx={{ py: 1, px: 4, borderRadius: 2 }}
        >
          {saving ? "Saving..." : "Save Course"}
        </Button>
      </Stack>
    </Box>
  );
}

export default CourseForm;
