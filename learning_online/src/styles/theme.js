import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0'
    },
    secondary: {
      main: '#00897b'
    },
    background: {
      default: '#f5f7fb'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  shape: {
    borderRadius: 10
  }
});

export default theme;
