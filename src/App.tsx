import { useState, useRef, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Chat from './components/Chat'
import MCPService from './services/mcpService'
import { Tool, ServiceConfig } from './types/mcp'

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

  // Create a mutable ref for the service configuration
  const configRef = useRef<ServiceConfig>({ tools });
  
  // Create MCPService instance once
  const mcpServiceRef = useRef<MCPService | null>(null);
  
  // Initialize the service on mount
  useEffect(() => {
    configRef.current = { tools };
    if (!mcpServiceRef.current) {
      mcpServiceRef.current = new MCPService(configRef.current);
    }
  }, [tools]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {mcpServiceRef.current && <Chat mcpService={mcpServiceRef.current} tools={tools} setTools={setTools} />}
    </ThemeProvider>
  )
}

export default App
