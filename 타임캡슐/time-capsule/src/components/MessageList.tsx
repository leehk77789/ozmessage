import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { db } from '../firebase';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface Message {
  id: string;
  content: string;
  date: Date;
  batch: string;
  name: string;
  createdAt: Date;
}

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'messages'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          content: data.content,
          date: data.date.toDate(),
          batch: data.batch,
          name: data.name,
          createdAt: data.createdAt.toDate(),
        });
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  if (messages.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          저장된 메시지
        </Typography>
        <Typography color="text.secondary" align="center">
          아직 저장된 메시지가 없습니다.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        저장된 메시지
      </Typography>
      <List>
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(message.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="subtitle1" component="span">
                      {message.batch}기 {message.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {message.content}
                    </Typography>
                  </Box>
                }
                secondary={`전송 예정일: ${format(message.date, 'PPP', { locale: ko })}`}
              />
            </ListItem>
            {index < messages.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default MessageList; 