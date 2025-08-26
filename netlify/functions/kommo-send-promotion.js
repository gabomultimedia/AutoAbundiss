import fetch from 'node-fetch';
import { config } from './config.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const promotion = JSON.parse(event.body);
    
    // Obtener token válido de Kommo
    const tokenResponse = await fetch(`${config.kommo.baseUrl}/oauth2/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.kommo.bearer}`
      },
      body: JSON.stringify({
        client_id: config.kommo.clientId,
        client_secret: config.kommo.clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Error obteniendo token de Kommo');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Crear mensaje de promoción para enviar a los contactos
    const message = `🎉 **${promotion.title}**\n\n${promotion.description}\n\n`;
    
    if (promotion.discount_type === 'percentage') {
      message += `💥 **${promotion.discount_value}% de descuento**\n`;
    } else {
      message += `💥 **$${promotion.discount_value} de descuento**\n`;
    }
    
    message += `\n📅 Válida desde: ${new Date(promotion.starts_at).toLocaleDateString('es-ES')}\n`;
    message += `📅 Válida hasta: ${new Date(promotion.ends_at).toLocaleDateString('es-ES')}\n\n`;
    message += `¡No te pierdas esta oferta especial! 🚀`;

    // Enviar mensaje a todos los contactos activos
    const contactsResponse = await fetch(`${config.kommo.baseUrl}/api/v4/contacts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!contactsResponse.ok) {
      throw new Error('Error obteniendo contactos de Kommo');
    }

    const contacts = await contactsResponse.json();
    
    // Enviar mensaje a cada contacto
    const sendPromises = contacts._embedded.contacts.map(async (contact) => {
      try {
        await fetch(`${config.kommo.baseUrl}/api/v4/leads/${contact.id}/notes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: message,
            note_type: 'common'
          })
        });
      } catch (error) {
        console.warn(`Error enviando mensaje a contacto ${contact.id}:`, error);
      }
    });

    await Promise.allSettled(sendPromises);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Promoción enviada a Kommo exitosamente',
        contacts_notified: contacts._embedded.contacts.length
      })
    };

  } catch (error) {
    console.error('Error enviando promoción a Kommo:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message
      })
    };
  }
}
