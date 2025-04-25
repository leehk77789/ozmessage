import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Fade, Zoom, IconButton,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CAMP_OPTIONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTheme } from '@mui/material/styles';

// 이미지 업로드 인풋을 위한 스타일 컴포넌트
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const MessageForm: React.FC = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  
  // 상태 관리
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [campId, setCampId] = useState('');
  const [batch, setBatch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // 페이지 초기화 효과
  useEffect(() => {
    // 페이지 로드 시 스크롤 위치를 맨 위로 재설정
    window.scrollTo(0, 0);
    
    // 애니메이션 스타일 초기화
    const resetStyles = () => {
      const root = document.documentElement;
      root.style.setProperty('--initial-transform', 'none');
      root.style.setProperty('--initial-opacity', '1');
    };
    
    resetStyles();
    
    // 성공 메시지 스타일 설정
    const successMessage = document.querySelector('.success-message');
    if (successMessage && successMessage instanceof HTMLElement) {
      successMessage.style.position = 'fixed';
      successMessage.style.top = '50%';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translate(-50%, -50%)';
      successMessage.style.zIndex = '1500';
    }

    // 이미지 미리 로드
    const preloadImage = new Image();
    preloadImage.onload = () => {
      setMainImageLoaded(true);
    };
    preloadImage.src = '/images/오즈코딩스쿨타임캡슐.png';
  }, []);

  // 이미지 로딩 완료 시 페이지 준비 완료 상태로 설정
  useEffect(() => {
    if (mainImageLoaded) {
      setPageReady(true);
    }
  }, [mainImageLoaded]);

  // 선택한 이미지 미리보기 설정
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // 이미지 리사이징 및 Base64 변환 함수
  const resizeAndConvertToBase64 = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // 이미지 크기 계산
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }
          
          // 캔버스 생성 및 이미지 그리기
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('캔버스 컨텍스트를 가져올 수 없습니다.'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // 압축된 Base64 문자열 생성
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // 이미지 업로드 처리 함수
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!file) return '';
    
    try {
      setUploading(true);
      
      // 진행률 업데이트 설정
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 90) {
          clearInterval(interval);
        }
        setUploadProgress(progress);
      }, 100);
      
      // 이미지 리사이징 및 Base64 변환
      const base64Image = await resizeAndConvertToBase64(file, 800, 800, 0.6);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      return base64Image;
      
    } catch (error) {
      console.error("이미지 처리 중 오류 발생:", error);
      alert('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      return '';
    } finally {
      setUploading(false);
    }
  };

  // 파일 선택 처리
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // 10MB 이하 파일만 허용
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하만 가능합니다.');
        return;
      }
      setImageFile(file);
    }
  };

  // 이미지 제거
  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!message || !sender || !campId || !batch) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 기수 입력값 유효성 검사 - 숫자만 허용
    if (!/^\d+$/.test(batch)) {
      alert('기수는 숫자만 입력 가능합니다.');
      return;
    }

    try {
      // 이미지 처리
      let uploadedImageUrl = '';
      if (imageFile) {
        uploadedImageUrl = await handleImageUpload(imageFile);
      }

      // Firestore에 메시지 저장
      await addDoc(collection(db, 'messages'), {
        text: message,
        sender,
        campId,
        batch,
        timestamp: serverTimestamp(),
        userId: currentUser?.uid || null,
        imageUrl: uploadedImageUrl || null,
      });

      // 폼 초기화 및 성공 상태 설정
      resetForm();
      setSubmitted(true);
      
      // 4초 후 폼 다시 보이게 설정
      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
      
    } catch (error) {
      console.error("메시지 저장 중 오류 발생:", error);
      alert('메시지 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  // 폼 초기화 함수
  const resetForm = () => {
    setMessage('');
    setSender('');
    setCampId('');
    setBatch('');
    setImageFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
  };

  return (
    <Box 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        mt: 4, 
        px: 2,
        position: 'relative',
        minHeight: '400px',
        transform: 'none',
        opacity: 1
      }}
    >
      {!pageReady ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px' 
        }}>
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            콘텐츠를 불러오는 중...
          </Typography>
        </Box>
      ) : (
        <>
          {/* 페이지 제목 */}
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 'bold',
              color: '#1a3e72',
              textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            타임캡슐 메시지 작성
          </Typography>
          
          {/* 타임캡슐 이미지 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 4, 
            mt: 2
          }}>
            <img 
              src="/images/오즈코딩스쿨타임캡슐.png" 
              alt="오즈코딩스쿨 타임캡슐" 
              style={{ 
                width: '100%', 
                maxHeight: '300px', 
                objectFit: 'contain' 
              }}
            />
          </Box>
          
          {/* 메시지 입력 폼 */}
          {!submitted && (
            <Paper 
              component="form" 
              onSubmit={handleSubmit}
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 4 }, 
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              <TextField
                fullWidth
                label="이름"
                variant="outlined"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
              
              <TextField
                fullWidth
                label="메시지"
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 3 }}
                required
              />
              
              {/* 캠프 선택과 기수 선택 */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="camp-select-label">캠프 선택</InputLabel>
                  <Select
                    labelId="camp-select-label"
                    value={campId}
                    label="캠프 선택"
                    onChange={(e: SelectChangeEvent) => setCampId(e.target.value)}
                    required
                  >
                    {CAMP_OPTIONS.map((camp) => (
                      <MenuItem key={camp.value} value={camp.value}>{camp.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* 기수 선택 */}
                <TextField
                  fullWidth
                  label="기수"
                  variant="outlined"
                  placeholder="숫자만 입력 (예: 1, 2, 3...)"
                  value={batch}
                  onChange={(e) => {
                    // 숫자만 입력 가능하도록 설정
                    const value = e.target.value.replace(/\D/g, '');
                    setBatch(value);
                  }}
                  inputProps={{ 
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  required
                />
              </Box>
              
              {/* 이미지 업로드 섹션 */}
              <Box sx={{ mb: 3 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ mb: 2 }}
                  disabled={!!imageFile || uploading}
                >
                  이미지 추가
                  <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                </Button>
                
                {previewUrl && (
                  <Box sx={{ position: 'relative', mt: 2 }}>
                    <img 
                      src={previewUrl} 
                      alt="미리보기" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        border: '1px solid #eee'
                      }} 
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                      }}
                      size="small"
                      onClick={removeImage}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                
                {uploading && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      업로드 중... {uploadProgress}%
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* 제출 버튼 */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<SendIcon />}
                  disabled={!message || !sender || !campId || !batch || uploading}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 8,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                    }
                  }}
                >
                  타임캡슐 묻어두기
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* 제출 완료 메시지 */}
          {submitted && (
            <Box 
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '600px',
                textAlign: 'center',
                p: 4,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: 6,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
                zIndex: 1500,
                opacity: 1
              }}
              className="success-message"
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mb: 3,
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: 100,
                    height: 80,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 2,
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 4px 12px rgba(167, 201, 87, 0.5)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: 40,
                      height: 15,
                      bgcolor: theme.palette.primary.dark,
                      top: -15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: 120,
                    height: 30,
                    bgcolor: theme.palette.secondary.main,
                    borderRadius: 2,
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 4px 12px rgba(188, 108, 37, 0.5)'
                  }}
                />
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2, 
                  color: theme.palette.primary.dark,
                  fontFamily: '"Gaegu", cursive',
                  fontSize: '1.8rem'
                }}
              >
                타임캡슐이 성공적으로 묻혔습니다!
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  color: theme.palette.text.primary,
                  lineHeight: 1.6,
                  maxWidth: 500 
                }}
              >
                소중한 메시지를 타임캡슐에 담아주셔서 감사합니다. 여러분의 메시지는 안전하게 보관되어 특별한 순간에 다시 만나게 될 거예요.
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: 2,
                  '& span': {
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    margin: '0 4px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    animation: 'twinkle 1.5s infinite ease-in-out'
                  },
                  '& span:nth-of-type(2)': {
                    animationDelay: '0.3s',
                    backgroundColor: theme.palette.secondary.main
                  },
                  '& span:nth-of-type(3)': {
                    animationDelay: '0.6s',
                    backgroundColor: theme.palette.primary.dark
                  }
                }}
              >
                <span></span>
                <span></span>
                <span></span>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MessageForm; 