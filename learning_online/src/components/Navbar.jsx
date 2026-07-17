import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

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
                <Button component={RouterLink} to="/dashboard" color="inherit">
                  Dashboard
                </Button>
                <Button component={RouterLink} to="/my-courses" color="inherit">
                  My Courses
                </Button>
                {user?.role === "student" && (
                  <Button component={RouterLink} to="/teacher-application" color="inherit">
                    Become a Teacher
                  </Button>
                )}
                {user?.role === "admin" && (
                  <>
                    <Button component={RouterLink} to="/admin/users" color="inherit">
                      Users
                    </Button>
                    <Button component={RouterLink} to="/admin/teacher-applications" color="inherit">
                      Applications
                    </Button>
                  </>
                )}
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
