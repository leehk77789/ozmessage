import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface MessageCompleteProps {
  isVisible: boolean;
  onClose: () => void;
}

const MessageComplete: React.FC<MessageCompleteProps> = ({ isVisible, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, #F8F4E3 0%, #F0EAD6 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          {/* 땅 배경 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ 
              duration: 2,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '40%',
              background: 'linear-gradient(to bottom, #8B4513, #654321)',
              borderTopLeftRadius: '50% 20%',
              borderTopRightRadius: '50% 20%',
              zIndex: 1,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.2)'
            }}
          />

          {/* 메시지 카드 */}
          <motion.div
            initial={{ y: 0, scale: 1, opacity: 1 }}
            animate={{ y: '100vh', scale: 0.8, opacity: 0 }}
            transition={{ 
              duration: 3.5,
              delay: 1.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{
              position: 'relative',
              zIndex: 2,
              width: '80%',
              maxWidth: '600px',
              padding: '2.5rem',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <AutoAwesomeIcon sx={{ fontSize: 60, color: '#8B4513', mb: 2 }} />
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    textAlign: 'center',
                    mb: 2,
                    fontFamily: 'Gaegu, cursive',
                    color: '#8B4513',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  메시지가 타임캡슐에 안전하게 보관되었습니다
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    textAlign: 'center',
                    mb: 4,
                    fontFamily: 'Gaegu, cursive',
                    color: '#654321',
                    fontSize: '1.3rem',
                    lineHeight: 1.6
                  }}
                >
                  6개월 후에 다시 만나요!
                </Typography>

                <Button
                  variant="contained"
                  onClick={handleClose}
                  sx={{
                    background: 'linear-gradient(45deg, #8B4513 30%, #654321 90%)',
                    color: 'white',
                    padding: '12px 36px',
                    fontSize: '1.1rem',
                    borderRadius: '30px',
                    boxShadow: '0 4px 20px rgba(139, 69, 19, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(139, 69, 19, 0.4)',
                      background: 'linear-gradient(45deg, #654321 30%, #8B4513 90%)',
                    }
                  }}
                >
                  확인
                </Button>
              </Box>
            </motion.div>
          </motion.div>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default MessageComplete; 