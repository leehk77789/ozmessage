import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin: authAdmin } = useAuth();
  
  // 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      
      // localStorage와 sessionStorage 모두 확인
      const localAdmin = localStorage.getItem('isAdmin') === 'true';
      const sessionAdmin = sessionStorage.getItem('isAdmin') === 'true';
      
      setIsAdmin(!!user && (localAdmin || sessionAdmin));
    });
    
    return () => unsubscribe();
  }, []);

  // 페이지 변경 시 인증 상태 다시 확인
  useEffect(() => {
    const localAdmin = localStorage.getItem('isAdmin') === 'true';
    const sessionAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    setIsAdmin(isAuthenticated && (localAdmin || sessionAdmin));
  }, [location.pathname, isAuthenticated]);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('isAdmin');
      sessionStorage.removeItem('isAdmin');
      navigate('/admin/login');
    } catch (error) {
      // console.error('로그아웃 실패:', error);
    }
    handleClose();
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: '2px solid rgba(167, 201, 87, 0.5)',
        backdropFilter: 'blur(5px)',
        background: 'rgba(248, 244, 227, 0.85)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Typography 
                variant="h6" 
                component={Link} 
                to="/" 
                sx={{ 
                  fontWeight: 700, 
                  textDecoration: 'none', 
                  color: theme.palette.primary.dark,
                  fontFamily: '"Gaegu", sans-serif',
                  fontSize: '1.8rem'
                }}
              >
                OZ 타임캡슐
              </Typography>
            </motion.div>
          </Box>
          
          {isMobile ? (
            <Box>
              <IconButton 
                edge="end" 
                color="inherit" 
                aria-label="menu"
                onClick={handleClick}
              >
                <MenuIcon sx={{ color: theme.palette.primary.dark }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem 
                  onClick={() => { navigate('/'); handleClose(); }}
                  selected={isActive('/')}
                  sx={{ fontWeight: isActive('/') ? 700 : 400 }}
                >
                  편지 작성
                </MenuItem>
                
                {isAuthenticated && isAdmin ? (
                  <>
                    <MenuItem 
                      onClick={() => { navigate('/admin/messages'); handleClose(); }}
                      selected={isActive('/admin/messages')}
                      sx={{ fontWeight: isActive('/admin/messages') ? 700 : 400 }}
                    >
                      관리자 페이지
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                  </>
                ) : (
                  <MenuItem 
                    onClick={() => { navigate('/admin/login'); handleClose(); }}
                    selected={isActive('/admin/login')}
                    sx={{ fontWeight: isActive('/admin/login') ? 700 : 400 }}
                  >
                    관리자 로그인
                  </MenuItem>
                )}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                component={Link} 
                to="/"
                color="primary"
                variant={isActive('/') ? 'contained' : 'text'}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: isActive('/') ? theme.palette.primary.main : 'rgba(167, 201, 87, 0.1)'
                  }
                }}
              >
                편지 작성
              </Button>
              
              {isAuthenticated && isAdmin ? (
                <>
                  <Button 
                    component={Link} 
                    to="/admin/messages"
                    color="primary"
                    variant={isActive('/admin/messages') ? 'contained' : 'text'}
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      '&:hover': {
                        backgroundColor: isActive('/admin/messages') ? theme.palette.primary.main : 'rgba(167, 201, 87, 0.1)'
                      }
                    }}
                  >
                    관리자 페이지
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    color="secondary"
                    variant="outlined"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      '&:hover': {
                        backgroundColor: 'rgba(188, 108, 37, 0.1)'
                      }
                    }}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button 
                  component={Link} 
                  to="/admin/login"
                  color="secondary"
                  variant={isActive('/admin/login') ? 'contained' : 'outlined'}
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: isActive('/admin/login') ? theme.palette.secondary.main : 'rgba(188, 108, 37, 0.1)'
                    }
                  }}
                >
                  관리자 로그인
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tooltip title="비밀 통로" placement="bottom">
                <IconButton
                  onClick={() => navigate('/secret')}
                  sx={{
                    color: '#8B4513',
                    '&:hover': {
                      background: 'rgba(139, 69, 19, 0.1)',
                      transform: 'rotate(15deg)'
                    },
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <LockIcon />
                </IconButton>
              </Tooltip>
            </motion.div>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 