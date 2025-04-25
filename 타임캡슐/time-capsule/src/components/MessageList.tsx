import React, { useState, useEffect, useRef, createRef } from 'react';
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
  Zoom,
  Fade,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { collection, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import FilterListIcon from '@mui/icons-material/FilterList';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import { CAMP_OPTIONS } from '../constants';

// 메시지 인터페이스 정의
interface Message {
  id: string;
  name?: string;
  sender?: string;
  message?: string;
  text?: string;
  batch?: string;
  camp?: string;
  campId?: string;
  timestamp: any;
  imageUrl?: string;
}

const MessageList: React.FC = () => {
  // 상태 관리
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [nodeRefs, setNodeRefs] = useState<React.RefObject<HTMLDivElement>[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  // 오디오 참조
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 캠프 ID를 캠프명으로 변환하는 함수
  const getCampName = (campId: string): string => {
    const camp = CAMP_OPTIONS.find(camp => camp.value === campId);
    return camp ? camp.label : campId;
  };

  // 메시지 데이터 로드
  useEffect(() => {
    setLoading(true);
    
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => {
        const data = doc.data();
        const campId = data.campId || data.camp || '';
        
        return {
          id: doc.id,
          ...data,
          name: data.sender || data.name || '',
          message: data.text || data.message || '',
          camp: getCampName(campId),
          campId: campId,
          batch: data.batch || '1',
          timestamp: data.timestamp?.toDate() || new Date()
        };
      }) as Message[];
      
      setMessages(messageData);
      setFilteredMessages(messageData);
      setNodeRefs(messageData.map(() => createRef<HTMLDivElement>()));
      setLoading(false);
    });

    return () => {
      unsubscribeMessages();
    };
  }, []);

  // 필터 적용
  useEffect(() => {
    let filtered = [...messages];
    
    if (selectedCamp) {
      filtered = filtered.filter(message => message.campId === selectedCamp || message.camp === selectedCamp);
    }
    
    if (selectedBatch) {
      filtered = filtered.filter(message => message.batch === selectedBatch);
    }
    
    setFilteredMessages(filtered);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  }, [messages, selectedCamp, selectedBatch]);

  // 필터 메뉴 토글
  const toggleFilterMenu = () => {
    setFilterMenuOpen(!filterMenuOpen);
  };

  // 필터 초기화
  const resetFilters = () => {
    setSelectedCamp('');
    setSelectedBatch('');
    setFilteredMessages(messages);
    setCurrentPage(1);
  };

  // 페이지네이션 계산
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // 재생 시작 함수
  const handlePlay = () => {
    if (filteredMessages.length === 0) {
      setFilteredMessages(messages);
      setTimeout(() => {
        startPlayback();
      }, 100);
    } else {
      startPlayback();
    }
  };
  
  // 재생 시작 공통 기능
  const startPlayback = () => {
    setIsPlaying(true);
    setShowThankYou(false);
    handleFullscreen();
    hideAllNavElements();
    playBackgroundMusic();
    
    // 모든 메시지 재생 후 감사 메시지 표시 및 종료
    const lastMessageDuration = (filteredMessages.length - 1) * 8 + 15 + 2;
    setTimeout(() => {
      setShowThankYou(true);
      
      setTimeout(() => {
        endPlayback();
      }, 8000);
    }, lastMessageDuration * 1000);
  };
  
  // 재생 종료 공통 기능
  const endPlayback = () => {
    setIsPlaying(false);
    exitFullscreen();
    showAllNavElements();
    stopBackgroundMusic();
  };

  // 배경 음악 재생 함수
  const playBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('음악 재생 실패:', error);
      });
    }
  };

  // 배경 음악 정지 함수
  const stopBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 음소거 토글 함수
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // 모든 navbar 및 헤더 요소 숨기는 함수
  const hideAllNavElements = () => {
    document.body.classList.add('playing-mode');
    
    const navElements = document.querySelectorAll('nav, header, .navbar, .MuiAppBar-root, .nav, .header, .app-bar, [role="navigation"]');
    navElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.setAttribute('aria-hidden', 'true');
      }
    });
    
    document.body.style.overflow = 'hidden';
    document.body.style.paddingTop = '0';
  };

  // 모든 요소 다시 표시하는 함수
  const showAllNavElements = () => {
    document.body.classList.remove('playing-mode');
    
    const navElements = document.querySelectorAll('nav, header, .navbar, .MuiAppBar-root, .nav, .header, .app-bar, [role="navigation"]');
    navElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = '';
        el.style.visibility = '';
        el.style.opacity = '';
        el.removeAttribute('aria-hidden');
      }
    });
    
    document.body.style.overflow = '';
    document.body.style.paddingTop = '';
  };

  // 전체화면 함수
  const handleFullscreen = () => {
    hideAllNavElements();
    
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("전체화면 전환 실패:", err);
      });
    }
  };

  // 전체화면 종료 함수
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

  // 날짜 포맷 함수
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

  // 데이터 추출
  const camps = Array.from(new Set(messages.map(msg => msg.camp)));
  const batches = Array.from(new Set(messages.map(msg => msg.batch)));

  // 컴포넌트 언마운트 시 클래스 제거 및 요소 원상 복구
  useEffect(() => {
    return () => {
      showAllNavElements();
      stopBackgroundMusic();
    };
  }, []);

  return (
    <Box className="ghibli-background">
      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
      
      {/* 오디오 요소 */}
      <audio ref={audioRef} src="/music/공일오비 - 이젠 안녕.mp3" loop />
      
      <Box className="ghibli-container">
        {!isPlaying && (
          <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
              {/* 헤더 */}
              <Zoom in={true} timeout={800}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                  <FormatListBulletedIcon sx={{ fontSize: '2.5rem', mr: 1, color: 'var(--primary-dark)' }} />
                  <Typography variant="h4" component="h1" className="ghibli-title">
                    관리자 페이지
                  </Typography>
                </Box>
              </Zoom>

              {/* 필터 섹션 */}
              <Fade in={true} timeout={1000}>
                <Paper elevation={3} className="ghibli-paper" sx={{ p: 3, mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
                    >
                      <FilterListIcon sx={{ mr: 1 }} />
                      필터 옵션
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={toggleFilterMenu}
                      sx={{ 
                        display: { xs: 'flex', md: 'none' },
                        alignItems: 'center',
                        fontSize: '0.9rem'
                      }}
                    >
                      {filterMenuOpen ? '필터 닫기' : '필터 열기'}
                    </Button>
                  </Box>

                  <Fade in={filterMenuOpen || window.innerWidth >= 900} timeout={300}>
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' }, 
                        gap: 2, 
                        mb: 2
                      }}>
                        <FormControl fullWidth>
                          <InputLabel>캠프 선택</InputLabel>
                          <Select
                            value={selectedCamp}
                            label="캠프 선택"
                            onChange={(e) => setSelectedCamp(e.target.value)}
                            className="ghibli-text"
                          >
                            <MenuItem value="">전체</MenuItem>
                            {CAMP_OPTIONS.map(camp => (
                              <MenuItem key={camp.value} value={camp.value}>{camp.label}</MenuItem>
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
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={resetFilters}
                          className="ghibli-button"
                          startIcon={<FilterListIcon />}
                        >
                          필터 초기화
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handlePlay}
                          disabled={isPlaying || filteredMessages.length === 0}
                          className="ghibli-button"
                          startIcon={<PlayArrowIcon />}
                        >
                          {isPlaying ? '재생 중...' : '재생'}
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                </Paper>
              </Fade>

              {/* 메시지 목록 */}
              <Fade in={true} timeout={1200}>
                <Paper elevation={3} className="ghibli-paper">
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                      <CircularProgress color="primary" size={40} />
                      <Typography variant="h6" sx={{ ml: 2 }}>
                        메시지를 불러오는 중...
                      </Typography>
                    </Box>
                  ) : filteredMessages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <Typography variant="h6">
                        조건에 맞는 메시지가 없습니다.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ p: 2, borderBottom: '1px solid rgba(95, 75, 50, 0.1)' }}
                      >
                        총 <strong>{filteredMessages.length}</strong>개의 메시지
                      </Typography>
                      <List>
                        <TransitionGroup>
                          {currentMessages.map((message, index) => (
                            <CSSTransition 
                              key={message.id} 
                              timeout={500} 
                              classNames="message-item"
                              nodeRef={nodeRefs[index]}
                            >
                              <Box ref={nodeRefs[index]}>
                                <ListItem 
                                  alignItems="flex-start"
                                  sx={{ 
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': { backgroundColor: 'rgba(167, 201, 87, 0.05)' } 
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="h6" className="ghibli-subtitle">
                                          {message.name}
                                        </Typography>
                                        <Typography
                                          component="span"
                                          variant="body2"
                                          sx={{ ml: 2, opacity: 0.6 }}
                                        >
                                          {message.camp} / {message.batch}기
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <>
                                        <Typography
                                          component="span"
                                          variant="body1"
                                          className="ghibli-text"
                                          sx={{ 
                                            display: 'inline-block',
                                            my: 1,
                                            p: 1.5,
                                            backgroundColor: 'rgba(248, 244, 227, 0.6)', 
                                            borderRadius: '8px',
                                            whiteSpace: 'pre-line'
                                          }}
                                        >
                                          {message.message}
                                        </Typography>
                                        
                                        {message.imageUrl && (
                                          <Box sx={{ my: 2, maxWidth: '100%', textAlign: 'center' }}>
                                            <img 
                                              src={message.imageUrl} 
                                              alt="첨부 이미지"
                                              style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '300px', 
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                              }}
                                            />
                                          </Box>
                                        )}
                                        
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
                                  <Tooltip title="삭제" arrow>
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDelete(message.id)}
                                      sx={{ 
                                        '&:hover': { backgroundColor: 'rgba(239, 83, 80, 0.1)' } 
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </ListItem>
                                {index < currentMessages.length - 1 && <Divider />}
                              </Box>
                            </CSSTransition>
                          ))}
                        </TransitionGroup>
                      </List>
                      
                      {/* 페이지네이션 */}
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
                    </>
                  )}
                </Paper>
              </Fade>
            </Box>
          </Container>
        )}

        {/* 재생 화면 */}
        {isPlaying && (
          <Box className="movie-credits" sx={{ 
            width: '100%', 
            height: '100vh', 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            {/* 음소거 버튼 */}
            <IconButton
              onClick={toggleMute}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {isMuted ? <VolumeMuteIcon /> : <VolumeUpIcon />}
            </IconButton>
            
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
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 1
                    }}>
                      <Typography variant="h4" sx={{ 
                        mb: 1, 
                        color: '#f1c40f',
                        fontFamily: 'Gaegu, serif',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                      }}>
                        {message.name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: 'Gaegu, serif'
                      }}>
                        {message.camp} / {message.batch}기
                      </Typography>
                    </Box>
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

                    {message.imageUrl && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <img 
                          src={message.imageUrl}
                          alt="첨부 이미지"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        />
                      </Box>
                    )}
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
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
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