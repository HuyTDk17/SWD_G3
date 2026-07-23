import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Pagination
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import courseService from "../services/courseService";
import CourseCard from "../components/CourseCard";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const CATEGORIES = ["Programming Fundamentals", "Frontend", "Backend", "Database", "DevOps", "Mobile"];

function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [cefrLevel, setCefrLevel] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search input temp state
  const [searchTemp, setSearchTemp] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 6,
        search: search || undefined,
        language: language || undefined,
        cefrLevel: cefrLevel || undefined,
        category: category || undefined,
        sortBy: sortBy || undefined
      };
      
      const result = await courseService.getCourses(params);
      setCourses(result.items || []);
      if (result.meta) {
        setTotalPages(result.meta.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setError(courseService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadCourses());
  }, [page, search, language, cefrLevel, category, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchTemp);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchTemp("");
    setLanguage("");
    setCefrLevel("");
    setCategory("");
    setSortBy("");
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header section with background decoration */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)",
          color: "white",
          boxShadow: 3
        }}
      >
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Discover Courses
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Master programming languages and frameworks with expert-led courses.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, position: "sticky", top: 20 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Filters
                </Typography>
                <IconButton onClick={handleClearFilters} size="small" title="Clear all filters">
                  <FilterAltOffIcon />
                </IconButton>
              </Box>

              {/* Level filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Level</InputLabel>
                <Select
                  value={cefrLevel}
                  label="Level"
                  onChange={(e) => { setCefrLevel(e.target.value); setPage(1); }}
                >
                  <MenuItem value=""><em>All Levels</em></MenuItem>
                  {CEFR_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Category filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                >
                  <MenuItem value=""><em>All Categories</em></MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sorting filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                >
                  <MenuItem value=""><em>Default (Newest)</em></MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                  <MenuItem value="rating_desc">Highest Rated</MenuItem>
                  <MenuItem value="title_asc">Name: A-Z</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleClearFilters}
                size="small"
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Catalog Main Panel */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Search bar */}
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              size="medium"
              variant="outlined"
              placeholder="Search courses by title or description..."
              value={searchTemp}
              onChange={(e) => setSearchTemp(e.target.value)}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                "& fieldset": { borderRadius: 2 }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" color="primary">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {error && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "#ffebee", color: "#c62828", borderRadius: 2 }}>
              <Typography>{error}</Typography>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Loading courses...
              </Typography>
            </Box>
          ) : courses.length === 0 ? (
            <Box sx={{ textCenter: "center", py: 8, textAlign: "center" }}>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                No Courses Found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search criteria or clear the filters.
              </Typography>
            </Box>
          ) : (
            <>
              <div className="course-grid">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, val) => setPage(val)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default CourseCatalogPage;
