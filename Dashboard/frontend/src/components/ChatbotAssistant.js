import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Chip,
  Fade,
  CircularProgress,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDashboard } from '../context/DashboardContext';

const ChatbotAssistant = () => {
  const { nilmData, pvData } = useDashboard();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message
      setMessages([{
        role: 'assistant',
        content: "👋 Hi! I'm PowerPulse Assistant. I can help you understand your NILM and PV system data, explain faults, and answer questions about energy monitoring. How can I help you today?",
        timestamp: new Date().toISOString()
      }]);
      loadSuggestions();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/chatbot/suggest');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          session_id: sessionId,
          pv_data: pvData,
          nilm_data: nilmData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add bot response
      const botMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
        context: data.context_used
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please make sure the chatbot service is running on port 5003.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    try {
      await fetch('/api/chatbot/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      setMessages([{
        role: 'assistant',
        content: "Conversation cleared! How can I help you?",
        timestamp: new Date().toISOString()
      }]);
      loadSuggestions();
    } catch (error) {
      console.error('Clear error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
    setSuggestions([]);
  };

  return (
    <>
      {/* Chat Button - Bottom Right */}
      {!isOpen && (
        <Tooltip title="Chat with PowerPulse Assistant" placement="left">
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              zIndex: 9999,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 6px 30px rgba(16, 185, 129, 0.6)'
              },
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                },
                '50%': {
                  boxShadow: '0 6px 30px rgba(16, 185, 129, 0.6)'
                }
              }
            }}
          >
            <ChatIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Tooltip>
      )}

      {/* Chat Window */}
      <Fade in={isOpen}>
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100% - 48px)', sm: 400 },
            maxWidth: 400,
            height: { xs: 'calc(100% - 48px)', sm: 600 },
            maxHeight: 600,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <BotIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                PowerPulse Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Online • AI-powered
              </Typography>
            </Box>
            <Tooltip title="Clear conversation">
              <IconButton size="small" onClick={clearConversation} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1
                }}
              >
                {message.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: '#10b981', width: 32, height: 32 }}>
                    <BotIcon fontSize="small" />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: '75%',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' 
                      ? (theme.palette.mode === 'dark' ? '#2563eb' : '#3b82f6')
                      : (theme.palette.mode === 'dark' ? '#334155' : 'white'),
                    color: message.role === 'user' ? 'white' : theme.palette.text.primary,
                    borderBottomRightRadius: message.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: message.role === 'assistant' ? 4 : 16
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content}
                  </Typography>
                  {message.context && message.context.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {message.context.map((topic, i) => (
                        <Chip
                          key={i}
                          label={topic}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
                {message.role === 'user' && (
                  <Avatar sx={{ bgcolor: '#3b82f6', width: 32, height: 32 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>
            ))}

            {/* Suggestions */}
            {!isLoading && messages.length === 1 && suggestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Suggested questions:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {suggestions.slice(0, 4).map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: theme.palette.mode === 'dark' ? '#334155' : 'background.paper',
                        color: theme.palette.text.primary,
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {isLoading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#10b981', width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Thinking...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.background.paper, 
            borderTop: `1px solid ${theme.palette.divider}` 
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default ChatbotAssistant;
