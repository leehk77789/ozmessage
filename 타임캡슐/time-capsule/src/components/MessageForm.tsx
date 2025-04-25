import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  MenuItem,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const CAMP_OPTIONS = [
  '초격차 BE',
  '초격차 FE',
  '사업개발캠프',
  '풀스택',
  '디자이너'
];

const MessageForm: React.FC = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [camp, setCamp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !name || !batch || !camp) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        message,
        name,
        batch,
        camp,
        timestamp: serverTimestamp(),
      });
      setMessage('');
      setName('');
      setBatch('');
      setCamp('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('편지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
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
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              className="ghibli-button-secondary"
              onClick={() => navigate('/admin/login')}
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                padding: '8px 16px',
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  backgroundColor: 'rgba(188, 108, 37, 0.1)'
                }
              }}
            >
              관리자
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper elevation={3} className="ghibli-paper" sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" className="ghibli-title" gutterBottom sx={{ fontSize: '3rem', fontWeight: 700, mb: 2 }}>
                  타임캡슐
                </Typography>
                <Typography variant="h6" className="ghibli-subtitle" gutterBottom sx={{ fontSize: '1.8rem', fontWeight: 600 }}>
                  6개월 후의 나에게 전하는 편지
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={3} className="ghibli-paper" sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <TextField
                    select
                    fullWidth
                    label="캠프"
                    value={camp}
                    onChange={(e) => setCamp(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    required
                    className="ghibli-text"
                    sx={{ 
                      mb: 3,
                      '& .MuiInputLabel-root': { fontSize: '1.3rem' },
                      '& .MuiSelect-select': { fontSize: '1.3rem', padding: '14px' }
                    }}
                    InputLabelProps={{ style: { fontWeight: 600 } }}
                  >
                    {CAMP_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option} style={{ fontSize: '1.2rem' }}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    required
                    className="ghibli-text"
                    sx={{ 
                      mb: 3,
                      '& .MuiInputLabel-root': { fontSize: '1.3rem' },
                      '& .MuiInputBase-input': { fontSize: '1.3rem', padding: '14px' }
                    }}
                    InputLabelProps={{ style: { fontWeight: 600 } }}
                  />
                  <TextField
                    fullWidth
                    label="기수"
                    value={batch}
                    onChange={(e) => {
                      // 숫자만 입력 허용
                      const value = e.target.value;
                      if (value === '' || /^[0-9]+$/.test(value)) {
                        setBatch(value);
                      }
                    }}
                    margin="normal"
                    variant="outlined"
                    required
                    placeholder="예: 1"
                    className="ghibli-text"
                    type="number"
                    inputProps={{ min: 1 }}
                    sx={{ 
                      mb: 3,
                      '& .MuiInputLabel-root': { fontSize: '1.3rem' },
                      '& .MuiInputBase-input': { fontSize: '1.3rem', padding: '14px' }
                    }}
                    InputLabelProps={{ style: { fontWeight: 600 } }}
                  />
                  <TextField
                    fullWidth
                    label="편지"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows={5}
                    required
                    placeholder="6개월 후의 나에게 전하는 편지를 작성해주세요."
                    className="ghibli-text"
                    sx={{ 
                      mb: 3,
                      '& .MuiInputLabel-root': { fontSize: '1.3rem' },
                      '& .MuiInputBase-input': { fontSize: '1.3rem', lineHeight: 1.6 }
                    }}
                    InputLabelProps={{ style: { fontWeight: 600 } }}
                  />
                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      fullWidth
                      className="ghibli-button"
                      sx={{ 
                        py: 1.5,
                        fontSize: '1.3rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {isSubmitting ? '전송 중...' : '편지 보내기'}
                    </Button>
                  </Box>
                </form>
                {submitSuccess && (
                  <Typography
                    color="primary"
                    align="center"
                    sx={{ mt: 2, fontWeight: 'bold', fontSize: '1.3rem' }}
                    className="ghibli-text"
                  >
                    편지가 성공적으로 전송되었습니다!
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default MessageForm; 