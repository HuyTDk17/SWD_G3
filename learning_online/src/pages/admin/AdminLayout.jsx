import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/Book";
import HelpIcon from "@mui/icons-material/Help";
import StarIcon from "@mui/icons-material/Star";

// API imports
import { getAdminDashboard, getAdminCSVExportUrl } from "../../api/dashboardApi";
import { getAuditLogs, getConfigs, updateConfig } from "../../api/adminApi";

// Component imports
import UserManagementPage from "./UserManagementPage";
import TeacherApplicationsPage from "./TeacherApplicationsPage";
import AdminCoursesPage from "./AdminCoursesPage";
import AdminReviewsPage from "./AdminReviewsPage";

function AdminLayout() {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Config State
  const [configs, setConfigs] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logPages, setLogPages] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadConfigs = async () => {
    try {
      const res = await getConfigs();
      setConfigs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async (page) => {
    try {
      setLoadingLogs(true);
      const res = await getAuditLogs(page, 15);
      setAuditLogs(res.data.data || []);
      setLogPages(res.data.meta?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (tab === 5) {
      loadConfigs();
    } else if (tab === 6) {
      loadLogs(logPage);
    }
  }, [tab, logPage]);

  const handleUpdateConfig = async (key, newValue) => {
    try {
      await updateConfig(key, newValue);
      alert("System Configuration updated successfully!");
      loadConfigs();
    } catch (err) {
      console.error(err);
      alert("Failed to update config.");
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const catConfig = configs.find(c => c.key === "categories");
    if (!catConfig) return;
    const updated = [...catConfig.value, newCategory.trim()];
    handleUpdateConfig("categories", updated);
    setNewCategory("");
  };

  const handleRemoveCategory = (cat) => {
    const catConfig = configs.find(c => c.key === "categories");
    if (!catConfig) return;
    const updated = catConfig.value.filter(item => item !== cat);
    handleUpdateConfig("categories", updated);
  };

  const handleExportCSV = () => {
    window.open(getAdminCSVExportUrl(), "_blank");
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Admin Workspace...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Admin Management Workspace
          </Typography>
          <Typography color="text.secondary">
            Consolidated platform control settings, logs, listings, reviews, and catalog approvals.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Export CSV User Report
        </Button>
      </Box>

      {/* Tabs Menu Panel */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Analytics KPIs" />
          <Tab label="Users" />
          <Tab label="Teacher Applicants" />
          <Tab label="Course Approvals" />
          <Tab label="Moderate Reviews" />
          <Tab label="System Configurations" />
          <Tab label="Audit Trails" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tab === 0 && stats && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "primary.light", color: "primary.main", borderRadius: 2 }}>
                    <PeopleIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Total Users</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.totalUsers}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "success.light", color: "success.main", borderRadius: 2 }}>
                    <PeopleIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Active (30d)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.activeUsers30d}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "warning.light", color: "warning.main", borderRadius: 2 }}>
                    <BookIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Pending Courses</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.pendingCourseApprovals}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: "error.light", color: "error.main", borderRadius: 2 }}>
                    <HelpIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Pending Applicants</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.pendingTeacherApplications}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Growth Trend List */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              New Enrollments Trend (Last 6 Months)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {stats.growthTrend?.map((trend, idx) => (
                <ListItem key={idx} sx={{ py: 1.5, borderBottom: "1px solid #eaeaea" }}>
                  <ListItemText
                    primary={trend.month}
                    secondary={`Enrollments: ${trend.enrollments}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <UserManagementPage />
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <TeacherApplicationsPage />
        </Box>
      )}

      {tab === 3 && (
        <Box>
          <AdminCoursesPage />
        </Box>
      )}

      {tab === 4 && (
        <Box>
          <AdminReviewsPage />
        </Box>
      )}

      {tab === 5 && (
        <Box>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Course Categories List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
              {configs.find(c => c.key === "categories")?.value.map((cat, idx) => (
                <Chip
                  key={idx}
                  label={cat}
                  onDelete={() => handleRemoveCategory(cat)}
                  color="primary"
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1, maxWidth: 400 }}>
              <TextField
                label="Add Category"
                size="small"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleAddCategory}>
                Add
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {tab === 6 && (
        <Box>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              System Audit Logs
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {loadingLogs ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "grey.100" }}>
                      <TableRow>
                        <TableCell>Actor</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Target Type</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell>
                            {log.actorId?.fullName || "System"}
                            <Typography variant="caption" display="block" color="text.secondary">
                              {log.actorId?.email}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {log.action}
                          </TableCell>
                          <TableCell>
                            {log.targetType}
                          </TableCell>
                          <TableCell>
                            {log.ipAddress || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination Controls */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
                  <Button
                    size="small"
                    disabled={logPage <= 1}
                    onClick={() => setLogPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Typography sx={{ alignSelf: "center" }}>
                    Page {logPage} of {logPages}
                  </Typography>
                  <Button
                    size="small"
                    disabled={logPage >= logPages}
                    onClick={() => setLogPage(p => Math.min(logPages, p + 1))}
                  >
                    Next
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default AdminLayout;
