import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography } from '@mui/material';
import MessageForm from './components/MessageForm';
import MessageList from './components/MessageList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
            타임캡슐
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            6개월 후의 나에게 보내는 메시지
          </Typography>
          <MessageForm />
          <MessageList />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
