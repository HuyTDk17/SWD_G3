import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "../contexts/AuthContext";
import { getMyNotifications, markAsRead, markAllAsRead } from "../api/notificationApi";

function Navbar() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMyNotifications();
      const list = res.data.data || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      Promise.resolve().then(() => fetchNotifications());
      // Auto-poll notifications every 30 seconds for real-time alerts
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      Promise.resolve().then(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
    }
  }, [isAuthenticated]);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh on open
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif._id);
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      handleCloseMenu();

      // Route mapping based on notification type
      if (notif.type === "course") {
        navigate("/my-courses");
      } else if (notif.type === "application") {
        navigate("/profile");
      } else if (notif.type === "grade") {
        navigate("/my-courses");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, py: 1 }}>
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{ textDecoration: "none", color: "primary.main", fontWeight: 700 }}
          >
            Language Learning
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={RouterLink} to="/" color="inherit">
              All Courses
            </Button>

            {!loading && isAuthenticated && (
              <>
                {user?.role === "student" && (
                  <>
                    <Button component={RouterLink} to="/dashboard" color="inherit">
                      Dashboard
                    </Button>
                    <Button component={RouterLink} to="/my-courses" color="inherit">
                      My Courses
                    </Button>
                    <Button component={RouterLink} to="/ai-assistant" color="inherit">
                      AI Assistant
                    </Button>
                    <Button component={RouterLink} to="/teacher-application" color="inherit">
                      Become a Teacher
                    </Button>
                  </>
                )}
                {user?.role === "teacher" && (
                  <>
                    <Button component={RouterLink} to="/teacher/dashboard" color="inherit">
                      Teacher Dashboard
                    </Button>
                    <Button component={RouterLink} to="/teacher/courses" color="inherit">
                      My Courses
                    </Button>
                  </>
                )}
                {user?.role === "admin" && (
                  <Button component={RouterLink} to="/admin/dashboard" color="inherit">
                    Admin Workspace
                  </Button>
                )}

                {/* Notifications Bell (Step 11) */}
                <IconButton color="inherit" onClick={handleOpenMenu}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    sx: { width: 320, maxHeight: 400, borderRadius: 2 }
                  }}
                >
                  <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Button size="small" onClick={handleMarkAllRead} sx={{ textTransform: "none" }}>
                        Mark all read
                      </Button>
                    )}
                  </Box>
                  <Divider />
                  {notifications.length === 0 ? (
                    <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No notifications yet.
                      </Typography>
                    </MenuItem>
                  ) : (
                    notifications.map((n) => (
                      <MenuItem
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        sx={{
                          py: 1.5,
                          whiteSpace: "normal",
                          bgcolor: n.isRead ? "transparent" : "action.hover",
                          borderBottom: "1px solid #eaeaea",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 0.5
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 600 : 800 }}>
                          {n.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {n.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </Typography>
                      </MenuItem>
                    ))
                  )}
                </Menu>

                <Button component={RouterLink} to="/profile" color="inherit">
                  {user?.fullName || "Profile"}
                </Button>
                <Button onClick={handleLogout} color="inherit">
                  Logout
                </Button>
              </>
            )}

            {!loading && !isAuthenticated && (
              <>
                <Button component={RouterLink} to="/login" color="inherit">
                  Login
                </Button>
                <Button component={RouterLink} to="/register" variant="contained">
                  Register
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
