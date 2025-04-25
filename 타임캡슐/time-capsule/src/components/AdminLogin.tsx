import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Container } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const ADMIN_EMAIL = 'kdigital@nextrunners.co.kr'; // 관리자 이메일

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (email !== ADMIN_EMAIL) {
        setError('관리자 이메일이 아닙니다.');
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/messages');
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <Box className="ghibli-background">
      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
      
      <Box className="ghibli-container">
        <Container maxWidth="sm">
          <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={3} className="ghibli-paper" sx={{ p: 4, width: '100%' }}>
              <Typography 
                variant="h5" 
                component="h1" 
                gutterBottom 
                align="center"
                className="ghibli-title"
              >
                관리자 로그인
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="이메일"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ghibli-text"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="비밀번호"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ghibli-text"
                />
                {error && (
                  <Typography 
                    color="error" 
                    sx={{ mt: 2 }}
                    className="ghibli-text"
                  >
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  className="ghibli-button"
                >
                  로그인
                </Button>
              </form>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLogin; 