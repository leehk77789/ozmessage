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
    setError('');
    
    try {
      if (email !== ADMIN_EMAIL) {
        setError('관리자 이메일이 아닙니다.');
        return;
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 로그인 성공 시 관리자 권한 부여 - localStorage에 저장하고 세션 스토리지에도 저장
      if (userCredential.user) {
        // 권한 부여를 위해 localStorage와 sessionStorage 모두 사용
        localStorage.setItem('isAdmin', 'true');
        sessionStorage.setItem('isAdmin', 'true');
        
        // 잠시 대기 후 이동 (상태 업데이트 대기)
        setTimeout(() => {
          navigate('/admin/messages');
        }, 500);
      }
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      localStorage.removeItem('isAdmin');
      sessionStorage.removeItem('isAdmin');
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