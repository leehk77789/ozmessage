import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MessageList from './components/MessageList';
import AdminLogin from './components/AdminLogin';
import MessageForm from './components/MessageForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#A7C957', // 따뜻한 녹색
      light: '#DDE5B6',
      dark: '#6A994E',
    },
    secondary: {
      main: '#BC6C25', // 따뜻한 브라운
      light: '#DDA15E',
      dark: '#8C4516',
    },
    background: {
      default: '#F8F4E3', // 따뜻한 베이지
      paper: '#FEFAE0',
    },
    text: {
      primary: '#5F4B32', // 따뜻한 다크 브라운
      secondary: '#735F45',
    }
  },
  typography: {
    fontFamily: '"Gaegu", "Noto Sans KR", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#5F4B32',
    },
    h6: {
      fontWeight: 600,
      color: '#5F4B32',
    },
    body1: {
      color: '#5F4B32',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(95, 75, 50, 0.1)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MessageForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/messages" element={
            localStorage.getItem('isAdmin') === 'true' ? 
            <MessageList /> : 
            <Navigate to="/admin/login" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
