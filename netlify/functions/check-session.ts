import { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

const SESSION_SECRET = config.panel.sessionSecret;

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' }),
      };
    }

    // Extraer cookie de la sesión
    const cookies = event.headers.cookie || '';
    const sessionCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('ab_session='));

    if (!sessionCookie) {
      return {
        statusCode: 401,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'No hay sesión activa',
        }),
      };
    }

    const token = sessionCookie.split('=')[1];

    try {
      // Verificar JWT
      const decoded = jwt.verify(token, SESSION_SECRET) as any;
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          user: decoded.username,
          role: decoded.role,
          exp: decoded.exp,
        }),
      };
    } catch (jwtError) {
      return {
        statusCode: 401,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Sesión inválida o expirada',
        }),
      };
    }
  } catch (error) {
    console.error('Error en check-session:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
      }),
    };
  }
};
