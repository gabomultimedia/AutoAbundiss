// Configuración centralizada para reducir variables de entorno
export const config = {
  // Panel / Auth
  panel: {
    basicUser: process.env.PANEL_BASIC_USER || 'AdminAbundiss',
    basicPass: process.env.PANEL_BASIC_PASS || 'ln2^jov4NIbSrdf$od',
    sessionSecret: process.env.SESSION_SECRET || 'S8#CbLdJ@lkcw@kfRig&rBJm@OUyl@VI'
  },
  
  // Kommo
  kommo: {
    baseUrl: process.env.KOMMO_BASE_URL || 'https://new1645892779.kommo.com',
    clientId: process.env.KOMMO_CLIENT_ID || '286a8f30-a82c-44d5-8902-8930732547ca',
    clientSecret: process.env.KOMMO_CLIENT_SECRET || 'JouGbECArhejdEBYufuakREQBqH8fTTDq83SMKLd8rr929Auyzbadrw5DtOHqAHq',
    redirectUri: process.env.KOMMO_REDIRECT_URI || 'https://abundiss-console.netlify.app/.netlify/functions/kommo-oauth-callback',
    bearer: process.env.KOMMO_BEARER || 'tu-token-kommo'
  },
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || 'https://fcvwqwjsypossdqochde.supabase.co',
    serviceRole: process.env.SUPABASE_SERVICE_ROLE || 'tu-service-role-key',
    bucket: process.env.SUPABASE_BUCKET || 'abundiss-files'
  },
  
  // Deepseek
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-94706e3233474ad081b6e2d199669311'
  },
  
  // Google Calendar
  gcal: {
    calendarId: process.env.GCAL_CALENDAR_ID || 'd85cd569de00380a08a8e7f8b118a09122761706cfb3fa27c1647f46badfa710@group.calendar.google.com',
    clientEmail: process.env.GCP_CLIENT_EMAIL || 'abundiss-calendar@abundiss-consola.iam.gserviceaccount.com',
    privateKey: process.env.GCP_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCutkXdP46Z138H\nC7BJq0kD1mLqYqtx7i88G9sdEDewfGy1E5WVKdhiayV5tjRMiIZiIDOUTTUs78mC\nRbfh/FA6pOwfvqX3D7CT4yAJeeKNNqDQdBWDJGsf5WBDos7v+vhJCyLLvqxxVCMD\nij4C7lpGWOC8pfNyA+u9TF+UPh2JDPnh4c4NMeYQ15yaOrCdq5FK9faZMxdIoDHo\nDeevks10eFVrD67/AWduhcZ+lxolYIP7wbrxCMQDmNN4//vYeWDbHAdk77dYulCO\nTDRvP+gJ2//9Xq4cpWv5y0Mme/3Atix+Y7vAwszPiSUGxGyoFZ5CnZ5YvCKSkFQi\nj4anpFITAgMBAAECggEAPycY2vBR8g8g1iGmAAMfufjhOXsgIOcpgM9K5VcK4ksf\nmlaxb8E3+99iJPw1LGL/PHIKYvWDnrIwg1wDK3diYshhp9nosQUlXVewqWw69bOE\n7sS/T++2n0lxAhHUPo/X9sNFOSO7vp1cqLdsUe/phtsypU5RUOnU6VC1jebkEzkZ\ngvwFxsRe3oUCEfAQ7S/MFkp7XCRohFHkMhTFEZKs6LgFDOO7Okzm+thpwajPV/8P\nP/ZdTfYsd32+njKtLNfaR1H70diIygw+85WZ7jB8pLGMlhCeikc3/YNMOGMRPaNF\nZloNZ4/Vh6Xxhb0sr+W9e9r0fvMbBttkpGqJqwWTkQKBgQDnzIrYlPzSNNZgezhN\nJrEANY/KIftkcyEIhXOQD9C8aF7D4nn0mNzN36NLoQ9LBzAMyhGO96OkNP+xqQVe\n5UM83zbAmTrOKMBkkmNMllxFN+SBmsfE5XPNeiSEryuKkUiRmrqp3/ZASWe52wvQ\nOPz66fGNtcHbXTm1LAMOY2J1gwKBgQDA8+z6GNVMXh25o5DD665O0TyNCVLZHmza\n9n7Lgk1pL58crFywtez/W51RQRWd81e6b+ked83S1Knp0by7LlKWWNbakhq2OoSB\nCiFq/zL1FSB+71z8tirH+Kzj737QUZOUHiKBPNRtBJJuUEF1rP8b6yjznetLlHla\nXDgwbhCcMQKBgFrYgk4xzghAZwh3InCySkqPs2P//3u112t0if8bA67jpMhWuX9Q\nbbFOBby9SbYZAg7xHwKOMZdIojGp0Y4IglqYDOhc5Xwo4oZIDRzWDSGfrzHQTJzx\nZHpSdX9++6yaFfvizWeIfAVj/4AKxk18GEHqcB4e7vQfTF+h+SypbMwrAoGAGSby\n6jsYeub92vgeY9uyEiYmTYA8o37a08Q0DRVEQATsKGyF3rvlO39WN0yEy/obK4v\n5j/ZvbTpHUiw4HmOXHjiMQXAo6aHJUcLyiXQH7CMVt+e8HZSp1ScPO44SrGHmlQ/\nTTd/vWJOMEEX914At0P1R6R7SpPlKclBrdZ7JdECgYEAqY7vFNlY+Cd38tIvNNbU\nsBUfjqahgADycngU66x6ThjdBl17xsUIgM29B0bHawh/l7xzPBw1nqFqJ4Kupppk\njDNP/fXyms/OBNPGORf00Sl4sCB0BsqPzLEBrjuSmg6G340ILBcth+1Ythrfjva5\nrkF2h71npv5WhLq5ZnaWfWc=\n-----END PRIVATE KEY-----\n',
    timezone: process.env.GCAL_TIMEZONE || 'America/Mexico_City'
  },
  
  // Debounce
  debounce: {
    ms: process.env.DEBOUNCE_MS || '12000'
  },
  
  // UI
  ui: {
    appName: process.env.APP_NAME || 'Abundiss Console',
    logoUrl: process.env.VITE_APP_LOGO_URL || 'https://abundiss.com/wp-content/uploads/2021/11/LogoB.png'
  }
};
