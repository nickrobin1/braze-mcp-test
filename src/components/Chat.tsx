import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Container,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message, Tool } from '../types/mcp';
import MCPService from '../services/mcpService';

interface ChatProps {
  mcpService: MCPService;
  tools: Tool[];
}

const Chat: React.FC<ChatProps> = ({ mcpService, tools }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectToMCP();
    return () => {
      mcpService.disconnect();
    };
  }, []);

  const connectToMCP = async () => {
    try {
      setIsLoading(true);
      await mcpService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await mcpService.sendMessage(input);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolToggle = (toolName: string) => {
    mcpService.toggleTool(toolName);
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 4 }}>
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Tools Section */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Available Tools
          </Typography>
          <List>
            {tools.map((tool) => (
              <ListItem key={tool.name}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tool.enabled}
                      onChange={() => handleToolToggle(tool.name)}
                    />
                  }
                  label={tool.name}
                />
                <Typography variant="body2" color="text.secondary">
                  {tool.description}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Messages Section */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: message.role === 'user' ? 'primary.light' : 'grey.100',
                  }}
                >
                  <ListItemText
                    primary={message.content}
                    secondary={message.timestamp.toLocaleTimeString()}
                  />
                </Paper>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Input Section */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={!isConnected || isLoading}
            />
            <Button
              variant="contained"
              endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSend}
              disabled={!isConnected || isLoading || !input.trim()}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat; 