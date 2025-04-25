import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import { collection, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  name: string;
  message: string;
  batch: string;
  camp: string;
  timestamp: any;
}

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);
  const navigate = useNavigate();

  // 로그인 및 메시지 데이터 로드
  useEffect(() => {
    // 로그인 상태 확인
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/admin/login');
      }
    });

    // 메시지 데이터 로드
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Message[];
      setMessages(messageData);
      setFilteredMessages(messageData); // 초기에 필터링된 메시지는 전체 메시지와 동일
    });

    setIsAdmin(localStorage.getItem('isAdmin') === 'true');

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, [navigate]);

  // 현재 페이지의 메시지 가져오기
  const getCurrentMessages = () => {
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    return filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // 필터 적용 함수
  const handleFilter = () => {
    let filtered = [...messages];
    
    if (selectedCamp) {
      filtered = filtered.filter(message => message.camp === selectedCamp);
    }
    
    if (selectedBatch) {
      filtered = filtered.filter(message => message.batch === selectedBatch);
    }
    
    setFilteredMessages(filtered);
    setCurrentPage(1); // 필터 적용 시 첫 페이지로 이동
  };

  // 재생 시작 함수
  const handlePlay = async () => {
    if (filteredMessages.length === 0) {
      setFilteredMessages(messages);
      setTimeout(() => {
        setIsPlaying(true);
        setShowThankYou(false);
        handleFullscreen();
      }, 100);
    } else {
      setIsPlaying(true);
      setShowThankYou(false);
      handleFullscreen();
    }

    // 모든 메시지 재생 후 감사 메시지 표시 및 종료
    // 마지막 메시지가 사라진 후 감사 메시지 표시
    const lastMessageDuration = (filteredMessages.length - 1) * 8 + 15 + 2; // 마지막 메시지 시작 + 애니메이션 지속 시간 + 추가 지연
    setTimeout(() => {
      setShowThankYou(true);
      
      setTimeout(() => {
        setIsPlaying(false);
        exitFullscreen();
      }, 8000);
    }, lastMessageDuration * 1000);
  };

  // 전체화면 함수
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("전체화면 전환 실패:", err);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error("전체화면 종료 실패:", err);
      });
    }
  };

  // 메시지 삭제 함수
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
    }
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const camps = Array.from(new Set(messages.map(msg => msg.camp)));
  const batches = Array.from(new Set(messages.map(msg => msg.batch)));
  const currentMessages = getCurrentMessages();
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  return (
    <Box className="ghibli-background">
      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
      
      <Box className="ghibli-container">
        {!isPlaying && (
          <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" className="ghibli-title">
                  관리자 페이지
                </Typography>
                <Button variant="outlined" className="ghibli-button-secondary" onClick={handleLogout}>
                  로그아웃
                </Button>
              </Box>

              <Paper elevation={3} className="ghibli-paper" sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>캠프 선택</InputLabel>
                    <Select
                      value={selectedCamp}
                      label="캠프 선택"
                      onChange={(e) => setSelectedCamp(e.target.value)}
                      className="ghibli-text"
                    >
                      <MenuItem value="">전체</MenuItem>
                      {camps.map(camp => (
                        <MenuItem key={camp} value={camp}>{camp}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>기수 선택</InputLabel>
                    <Select
                      value={selectedBatch}
                      label="기수 선택"
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="ghibli-text"
                    >
                      <MenuItem value="">전체</MenuItem>
                      {batches.map(batch => (
                        <MenuItem key={batch} value={batch}>{batch}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleFilter}
                  sx={{ mr: 2 }}
                  className="ghibli-button"
                >
                  필터 적용
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePlay}
                  disabled={isPlaying}
                  sx={{ mr: 2 }}
                  className="ghibli-button"
                >
                  {isPlaying ? '재생 중...' : '재생'}
                </Button>
              </Paper>

              <Paper elevation={3} className="ghibli-paper">
                <List>
                  {currentMessages.map((message, index) => (
                    <React.Fragment key={message.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Typography variant="h6" className="ghibli-subtitle">
                              {message.name}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body1"
                                className="ghibli-text"
                              >
                                {message.message}
                              </Typography>
                              <br />
                              <Typography
                                component="span"
                                variant="caption"
                                className="ghibli-text"
                                sx={{ opacity: 0.8 }}
                              >
                                작성일: {formatDate(message.timestamp)}
                              </Typography>
                            </>
                          }
                        />
                        {isAdmin && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(message.id)}
                            sx={{ minWidth: '80px' }}
                          >
                            삭제
                          </Button>
                        )}
                      </ListItem>
                      {index < currentMessages.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '1.1rem',
                        }
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          </Container>
        )}

        {isPlaying && (
          <Box className="movie-credits" sx={{ 
            width: '100%', 
            height: '100vh', 
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* 필터링된 메시지 표시 (영화 크레딧 스타일) */}
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              {filteredMessages.map((message, index) => (
                <Box
                  key={message.id}
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'center',
                    animation: `credits ${15}s linear ${index * 8}s forwards`,
                    opacity: 0,
                    '@keyframes credits': {
                      '0%': { transform: 'translateY(100vh)', opacity: 0 },
                      '10%': { transform: 'translateY(70vh)', opacity: 1 },
                      '90%': { transform: 'translateY(10vh)', opacity: 1 },
                      '100%': { transform: 'translateY(-30vh)', opacity: 0 }
                    }
                  }}
                >
                  <Box sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '20px',
                    width: { xs: '90%', sm: '80%', md: '70%' },
                    maxWidth: '800px',
                    maxHeight: '60vh',
                    margin: '0 auto',
                    borderRadius: '8px',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '4px',
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      mb: 2, 
                      color: '#f1c40f',
                      fontFamily: 'Gaegu, serif',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                    }}>
                      {message.name}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: 'white',
                      fontFamily: 'Gaegu, serif',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      wordBreak: 'keep-all',
                      overflowWrap: 'break-word',
                      flex: 1
                    }}>
                      {message.message}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {/* 감사 메시지 */}
              {showThankYou && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    textAlign: 'center',
                    animation: 'thankYou 8s ease-in-out forwards',
                    opacity: 0,
                    '@keyframes thankYou': {
                      '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' },
                      '20%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                      '80%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                      '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(1.1)' }
                    }
                  }}
                >
                  <Box sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '30px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    borderRadius: '16px'
                  }}>
                    <Typography variant="h4" sx={{ 
                      color: 'white',
                      fontFamily: 'Gaegu, serif',
                      lineHeight: 1.8,
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                    }}>
                      지금까지 오즈코딩스쿨이였습니다.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageList; 