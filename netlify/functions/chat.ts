import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  console.log('Chat function called with method:', event.httpMethod);
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: 'Method Not Allowed',
      headers: corsHeaders,
    };
  }

  try {
    console.log('Request body:', event.body);
    
    if (!event.body) {
      console.error('Empty request body');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Empty request body' }),
      };
    }
    
    const { message, messageHistory, enabledTools } = JSON.parse(event.body);
    
    if (!message || !messageHistory) {
      console.error('Missing required fields in request');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Prepare messages for OpenAI
    const messages = messageHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system message with available tools
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant with access to the following tools: ${enabledTools.map((t: any) => t.name).join(', ')}. 
      When you need to use a tool, respond with a JSON object containing the tool name and action details.`,
    };
    
    console.log('Calling OpenAI API...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not set');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    const completion = await openai.chat.completions.create({
      // @cursor-skip-start
      model: "gpt-4o-mini",
      // @cursor-skip-end
      messages: [systemMessage, ...messages],
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;
    
    console.log('OpenAI response received');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: assistantMessage }),
    };
  } catch (error) {
    console.error('Error details:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to process message', details: String(error) }),
    };
  }
}; 