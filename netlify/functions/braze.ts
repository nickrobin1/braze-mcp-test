import { Handler } from '@netlify/functions';

const BRAZE_API_KEY = process.env.BRAZE_API_KEY;
const BRAZE_INSTANCE_URL = process.env.BRAZE_INSTANCE_URL;

async function makeBrazeRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${BRAZE_INSTANCE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${BRAZE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      message: data.message || 'An error occurred',
      errors: data.errors,
      status: response.status,
    };
  }

  return data;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, data } = JSON.parse(event.body || '{}');
    let response;

    switch (action) {
      case 'getUser':
        response = await makeBrazeRequest('/users/export/ids', 'POST', {
          external_ids: [data.externalId],
          fields_to_export: [
            'external_id',
            'email',
            'first_name',
            'last_name',
            'attributes',
            'created_at',
            'updated_at'
          ]
        });
        break;

      case 'createUser':
        response = await makeBrazeRequest('/users/track', 'POST', {
          attributes: [data.user]
        });
        break;

      case 'updateUser':
        response = await makeBrazeRequest('/users/track', 'POST', {
          attributes: [{
            external_id: data.externalId,
            ...data.attributes
          }]
        });
        break;

      case 'deleteUser':
        response = await makeBrazeRequest('/users/delete', 'POST', {
          external_ids: [data.externalId]
        });
        break;

      default:
        throw new Error(`Unknown Braze action: ${action}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process Braze request' }),
    };
  }
}; 