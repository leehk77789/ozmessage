import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../firebase';

// Context에서 제공할 값들의 타입 정의
interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 기본값 설정
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  logout: async () => {}
});

// Context Hook
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider 컴포넌트
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };

  // 인증 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // 로그인된 사용자가 있고 localStorage에 isAdmin 값이 있으면 관리자로 설정
      if (user) {
        const localAdmin = localStorage.getItem('isAdmin') === 'true';
        const sessionAdmin = sessionStorage.getItem('isAdmin') === 'true';
        setIsAdmin(localAdmin || sessionAdmin);
      } else {
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    isAdmin,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 