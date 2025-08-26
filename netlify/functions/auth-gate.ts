import { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

const SESSION_SECRET = config.panel.sessionSecret;
const BASIC_USER = config.panel.basicUser;
const BASIC_PASS = config.panel.basicPass;

export const handler: Handler = async (event) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' }),
      };
    }

    const { username, password } = JSON.parse(event.body || '{}');

    // Verificar credenciales básicas
    if (username === BASIC_USER && password === BASIC_PASS) {
      // Generar JWT
      const token = jwt.sign(
        { 
          username, 
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 días
        },
        SESSION_SECRET
      );

      // Configurar cookie HttpOnly
      const cookie = `ab_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Autenticación exitosa',
          user: username,
        }),
      };
    } else {
      return {
        statusCode: 401,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Credenciales inválidas',
        }),
      };
    }
  } catch (error) {
    console.error('Error en auth-gate:', error);
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
