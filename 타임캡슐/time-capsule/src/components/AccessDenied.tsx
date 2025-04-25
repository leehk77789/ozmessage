import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Fade, Grow } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdminLogin = () => {
    navigate('/login');
  };

  const handleHomeReturn = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        backgroundColor: '#f5f5f5',
        backgroundImage: 'linear-gradient(to bottom right, #e8f5fe, #f5f5f5)',
      }}
    >
      <Grow
        in={mounted}
        timeout={800}
        style={{ transformOrigin: 'center top' }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#1a3e72',
            mb: 4,
            textAlign: 'center',
            textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          <LockIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle', mr: 1 }} />
          접근 제한
        </Typography>
      </Grow>

      <Fade in={mounted} timeout={1000}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            maxWidth: 500,
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: '#d32f2f'
            }}
          >
            관리자 전용 페이지
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: '#555',
              lineHeight: 1.7
            }}
          >
            죄송합니다. 이 페이지는 관리자 권한이 있는 사용자만 접근할 수 있습니다. 
            관리자 계정으로 로그인하거나 홈페이지로 돌아가 주세요.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mt: 3
            }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<LockIcon />}
              onClick={handleAdminLogin}
              sx={{
                py: 1.2,
                fontWeight: 'bold',
                backgroundColor: '#1a3e72',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: '#2c5496',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(26, 62, 114, 0.4)',
                }
              }}
            >
              관리자 로그인
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<HomeIcon />}
              onClick={handleHomeReturn}
              sx={{
                py: 1.2,
                fontWeight: 'bold',
                borderColor: '#1a3e72',
                color: '#1a3e72',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: 'rgba(26, 62, 114, 0.04)',
                  borderColor: '#2c5496',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              홈으로 돌아가기
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default AccessDenied; 