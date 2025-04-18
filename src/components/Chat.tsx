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
  setTools: React.Dispatch<React.SetStateAction<Tool[]>>;
}

const Chat: React.FC<ChatProps> = ({ mcpService, tools, setTools }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesLengthRef = useRef<number>(0);

  useEffect(() => {
    connectToMCP();
    
    // Set up interval to poll for new messages
    const messagePoller = setInterval(() => {
      const serviceMessages = mcpService.getMessageHistory();
      if (serviceMessages.length !== messagesLengthRef.current) {
        messagesLengthRef.current = serviceMessages.length;
        setMessages([...serviceMessages]);
      }
    }, 500); // Check every 500ms
    
    return () => {
      clearInterval(messagePoller);
      mcpService.disconnect();
    };
  }, [mcpService]);

  // Update the ref when messages change
  useEffect(() => {
    messagesLengthRef.current = messages.length;
  }, [messages]);

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
      // Update messages after sending
      const updatedMessages = mcpService.getMessageHistory();
      messagesLengthRef.current = updatedMessages.length;
      setMessages([...updatedMessages]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolToggle = (toolName: string) => {
    console.log(`Toggling tool ${toolName} in UI component`);
    
    // First update the tool in the MCP service
    mcpService.toggleTool(toolName);
    
    // Then update the UI state to match
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.name === toolName ? { ...tool, enabled: !tool.enabled } : tool
      )
    );
    
    console.log('Tools state updated in UI');
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