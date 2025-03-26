import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Chat from './components/Chat'
import MCPService from './services/mcpService'
import { Tool } from './types/mcp'

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  // Initialize with Braze tool
  const [tools, setTools] = useState<Tool[]>([
    {
      name: 'braze',
      description: 'Interact with Braze API endpoints for user management',
      enabled: false,
    },
  ]);
  
  // Create MCPService instance
  const [mcpService, setMcpService] = useState<MCPService | null>(null);
  
  // Initialize the service on mount
  useEffect(() => {
    const service = new MCPService({ tools });
    setMcpService(service);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {mcpService && <Chat mcpService={mcpService} tools={tools} setTools={setTools} />}
    </ThemeProvider>
  )
}

export default App
