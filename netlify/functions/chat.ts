import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, messageHistory, enabledTools } = JSON.parse(event.body || '{}');

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: assistantMessage }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process message' }),
    };
  }
}; 