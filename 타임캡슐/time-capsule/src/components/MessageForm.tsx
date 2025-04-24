import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import SendIcon from '@mui/icons-material/Send';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface MessageFormProps {
  onMessageSubmit?: (message: { content: string; date: Date; batch: string; name: string }) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ onMessageSubmit }) => {
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [batch, setBatch] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content && date && batch && name) {
      try {
        const docRef = await addDoc(collection(db, 'messages'), {
          content,
          date,
          batch,
          name,
          createdAt: new Date(),
        });
        console.log('Document written with ID: ', docRef.id);
        
        onMessageSubmit?.({ content, date, batch, name });
        setContent('');
        setBatch('');
        setName('');
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          새로운 메시지 작성
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="기수"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="메시지 내용"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              required
            />
            <DatePicker
              label="전송 날짜"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              minDate={new Date()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              size="large"
              disabled={!content || !date || !batch || !name}
            >
              메시지 보내기
            </Button>
          </Stack>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default MessageForm; 