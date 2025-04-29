import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import MessageList from './components/MessageList';
import AdminLogin from './components/AdminLogin';
import MessageForm from './components/MessageForm';
import AccessDenied from './components/AccessDenied';
import Navbar from './components/Navbar';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';

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

// 권한 확인을 위한 래퍼 컴포넌트
type ProtectedRouteProps = {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const ProtectedRoute = ({ children, isAuthenticated, isAdmin }: ProtectedRouteProps) => {
  // localStorage와 sessionStorage 모두 확인
  const hasLocalAdmin = localStorage.getItem('isAdmin') === 'true';
  const hasSessionAdmin = sessionStorage.getItem('isAdmin') === 'true';
  
  // 인증 상태 또는 스토리지 중 하나라도 관리자 권한이 있으면 허용
  if ((isAuthenticated && isAdmin) || hasLocalAdmin || hasSessionAdmin) {
    return <>{children}</>;
  }
  
  return <AccessDenied />;
};

// 페이지 전환 애니메이션을 위한 컴포넌트
const AnimatedRoutes = ({ isAuthenticated, isAdmin }: { isAuthenticated: boolean, isAdmin: boolean }) => {
  const location = useLocation();
  const nodeRef = useRef(null);
  
  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="page-transition"
        timeout={400}
        nodeRef={nodeRef}
        appear={true}
        enter={false}
        exit={false}
      >
        <Box ref={nodeRef} sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Routes location={location}>
            <Route path="/" element={<MessageForm />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/messages" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
                  <MessageList />
                </ProtectedRoute>
              } 
            />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      
      // 로그인된 사용자가 있고 localStorage에 isAdmin 값이 있으면 관리자로 설정
      if (user) {
        const localAdmin = localStorage.getItem('isAdmin') === 'true';
        const sessionAdmin = sessionStorage.getItem('isAdmin') === 'true';
        
        if (localAdmin || sessionAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 인증 상태 확인 중일 때는 아무것도 렌더링하지 않음 (깜빡임 방지)
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ flexGrow: 1 }}>
              <AnimatedRoutes isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
