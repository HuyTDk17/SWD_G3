import { CssBaseline, ThemeProvider } from "@mui/material";
import Navbar from "./components/Navbar";
import AppRoutes from "./routers/AppRoutes";
import theme from "./styles/theme";
import { AuthProvider } from "./contexts/AuthProvider";
import './assets/css/styles.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
