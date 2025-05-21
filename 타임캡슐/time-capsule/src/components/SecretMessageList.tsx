import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress
} from '@mui/material';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { CAMP_OPTIONS } from '../constants';

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

const SecretMessageList: React.FC = () => {
  const { campId, batch } = useParams<{ campId: string; batch: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 캠프 ID를 캠프명으로 변환하는 함수
  const getCampName = (campId: string): string => {
    const camp = CAMP_OPTIONS.find(camp => camp.value === campId);
    return camp ? camp.label : campId;
  };

  // 숫자형 캠프 코드와 문자형 캠프 코드 매핑 테이블 추가
  const CAMP_CODE_MAP: Record<string, string> = {
    '1': 'BACK',
    '2': 'FRNT',
    '3': 'BIZD',
    '4': 'FULL',
    '5': 'DESN'
  };

  // 메시지 데이터 로드
  useEffect(() => {
    setLoading(true);
    
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    
    // campId 매칭 보완: 문자/숫자 모두 매칭
    const campIdVariants = [campId];
    Object.entries(CAMP_CODE_MAP).forEach(([num, code]) => {
      if (code === campId) campIdVariants.push(num);
    });
    
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => {
        const data = doc.data();
        const messageCampId = data.campId || data.camp || '';
        
        return {
          id: doc.id,
          ...data,
          name: data.sender || data.name || '',
          message: data.text || data.message || '',
          camp: getCampName(messageCampId),
          campId: messageCampId,
          batch: data.batch || '1',
          timestamp: data.timestamp?.toDate() || new Date()
        };
      }).filter(message => 
        campIdVariants.includes(message.campId) && Number(message.batch) === Number(batch)
      ) as Message[];
      
      setMessages(messageData);
      setLoading(false);
    });

    return () => {
      unsubscribeMessages();
    };
  }, [campId, batch]);

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

  return (
    <Box className="ghibli-background">
      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontFamily: 'Gaegu, cursive',
              color: '#8B4513',
              fontWeight: 'bold'
            }}
          >
            {getCampName(campId || '')} {batch}기 메시지
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
              <CircularProgress color="primary" size={40} />
              <Typography variant="h6" sx={{ ml: 2 }}>
                메시지를 불러오는 중...
              </Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6">
                아직 메시지가 없습니다.
              </Typography>
            </Box>
          ) : (
            <Box>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ 
                    opacity: 0,
                    scale: 0.8,
                    y: 50,
                    rotateX: -30,
                    transformOrigin: 'center bottom'
                  }}
                  animate={{ 
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotateX: 0
                  }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    delay: index * 0.2
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    margin: '0 auto',
                    perspective: '1000px'
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      mb: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(139, 69, 19, 0.1)',
                      transformStyle: 'preserve-3d',
                      '&:hover': {
                        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          color: '#8B4513',
                          fontFamily: 'Gaegu, cursive',
                          fontSize: '1.3rem',
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {message.name}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#333',
                        fontFamily: 'Gaegu, cursive',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'keep-all',
                        mb: message.imageUrl ? 2 : 0
                      }}
                    >
                      {message.message}
                    </Typography>

                    {message.imageUrl && (
                      <Box
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <img
                          src={message.imageUrl}
                          alt="첨부된 이미지"
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                        />
                      </Box>
                    )}

                    <Box sx={{ 
                      mt: 2, 
                      borderTop: '1px solid rgba(139, 69, 19, 0.1)',
                      pt: 2
                    }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#8B4513',
                          fontFamily: 'Gaegu, cursive',
                          fontSize: '0.9rem',
                          opacity: 0.8
                        }}
                      >
                        작성일: {formatDate(message.timestamp)}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default SecretMessageList; 