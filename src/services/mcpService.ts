import { ServiceConfig, Tool, Message } from '../types/mcp';

class MCPService {
  private config: ServiceConfig;
  private messageHistory: Message[] = [];

  constructor(config: ServiceConfig) {
    console.log('MCPService initialized with config:', config);
    console.log('Initial tools:', JSON.stringify(config.tools));
    
    // Clone the tools array to avoid reference issues
    this.config = {
      tools: [...config.tools]
    };
  }

  async connect(): Promise<void> {
    console.log('MCPService connected');
    // No need to initialize anything
  }

  disconnect(): void {
    console.log('MCPService disconnected');
    // No cleanup needed
  }

  private async handleBrazeTool(data: any): Promise<any> {
    try {
      const response = await fetch('/api/braze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: data.action,
          data: {
            externalId: data.externalId,
            user: data.user,
            attributes: data.attributes,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process Braze request');
      }

      return await response.json();
    } catch (error) {
      console.error('Braze tool error:', error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<void> {
    // Add user message to history
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    this.messageHistory.push(userMessage);

    try {
      // Send message to OpenAI through Netlify Function
      console.log('Sending message to API...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          messageHistory: this.messageHistory,
          enabledTools: this.config.tools.filter(t => t.enabled),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to process message: ${response.status} ${response.statusText}`);
      }

      const { message: assistantMessage } = await response.json();
      console.log('Received assistant message:', assistantMessage);
      
      // Check if the response is a tool call
      try {
        const toolCall = JSON.parse(assistantMessage);
        if (toolCall.tool === 'braze') {
          const toolResponse = await this.handleBrazeTool(toolCall);
          // Add tool response to history
          this.messageHistory.push({
            role: 'assistant',
            content: JSON.stringify(toolResponse),
            timestamp: new Date(),
          });
          console.log('Added tool response to history');
        }
      } catch (e) {
        // If not a tool call, add as regular message
        this.messageHistory.push({
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date(),
        });
        console.log('Added regular message to history, current history length:', this.messageHistory.length);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      this.messageHistory.push({
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      });
    }
  }

  toggleTool(toolName: string): void {
    console.log('Toggling tool:', toolName);
    const tool = this.config.tools.find(t => t.name === toolName);
    if (tool) {
      tool.enabled = !tool.enabled;
      console.log(`Tool ${toolName} is now ${tool.enabled ? 'enabled' : 'disabled'}`);
    } else {
      console.warn(`Tool ${toolName} not found in config`);
    }
  }

  getMessageHistory(): Message[] {
    return this.messageHistory;
  }
}

export default MCPService; 