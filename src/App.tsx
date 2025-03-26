import { useState } from 'react'
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
  const [tools] = useState<Tool[]>([
    {
      name: 'braze',
      description: 'Interact with Braze API endpoints for user management',
      enabled: false,
    },
  ])

  // Initialize service with configuration
  const mcpService = new MCPService({
    tools,
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Chat mcpService={mcpService} tools={tools} />
    </ThemeProvider>
  )
}

export default App
