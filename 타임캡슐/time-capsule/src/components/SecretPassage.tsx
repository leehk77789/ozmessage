import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { CAMP_OPTIONS } from '../constants';

const SecretPassage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 입력값의 모든 공백 제거
    const trimmedCode = code.replace(/\s/g, '');
    if (!trimmedCode) {
      setError('비밀 코드를 입력해주세요.');
      return;
    }

    // base64 디코딩 시도
    let decoded = '';
    try {
      decoded = atob(trimmedCode);
    } catch {
      setError('유효하지 않은 코드입니다.');
      return;
    }
    const [campId, batch, ...rest] = decoded.split('-');
    if (!campId || !batch || rest.length > 0) {
      setError('유효하지 않은 코드입니다.');
      return;
    }

    // 캠프 ID 유효성 검사
    const isValidCamp = CAMP_OPTIONS.some(camp => camp.value === campId);
    if (!isValidCamp) {
      setError('유효하지 않은 코드입니다.');
      return;
    }

    // 기수 유효성 검사 (1-99)
    const batchNum = parseInt(batch);
    if (isNaN(batchNum) || batchNum < 1 || batchNum > 99) {
      setError('유효하지 않은 코드입니다.');
      return;
    }

    navigate(`/secret-messages/${campId}/${batch}`);
  };

  return (
    <Box className="ghibli-background">
      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            sx={{
              mt: 8,
              mb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(139, 69, 19, 0.1)'
              }}
            >
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
                비밀 통로
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  color: '#666',
                  fontFamily: 'Gaegu, cursive',
                  fontSize: '1.1rem'
                }}
              >
                비밀 코드를 입력하면<br />
                해당 캠프와 기수의 메시지를 볼 수 있습니다.
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="비밀 코드"
                  variant="outlined"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  error={!!error}
                  helperText={error}
                  inputProps={{
                    style: {
                      fontFamily: 'Gaegu, cursive',
                      fontSize: '1.2rem',
                      textAlign: 'center',
                      letterSpacing: '0.5em'
                    }
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(139, 69, 19, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(139, 69, 19, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B4513',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'Gaegu, cursive',
                      color: '#8B4513',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.5,
                    fontFamily: 'Gaegu, cursive',
                    fontSize: '1.2rem',
                    backgroundColor: '#8B4513',
                    '&:hover': {
                      backgroundColor: '#6B3410',
                    },
                  }}
                >
                  메시지 보기
                </Button>
              </form>
            </Paper>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SecretPassage; 