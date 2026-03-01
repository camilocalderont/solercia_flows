// ✅ CORRECTO: Configuracion de entorno segura en NestJS

// config.ts - Lee TODAS las variables de entorno
export const config = {
  // Base de datos - NUNCA hardcodear
  database: {
    host: process.env.POSTGRES_DB_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_DB_PORT || '5432'),
    username: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,  // Desde .env
    database: process.env.POSTGRES_DB_NAME,
  },

  // JWT - Secret fuerte y con expiracion
  jwt: {
    secret: process.env.JWT_SECRET,  // Generar con: openssl rand -base64 64
    expiresIn: '2h',                 // Siempre con expiracion
  },

  // API Token - Para autenticacion entre servicios
  api: {
    token: process.env.API_TOKEN,    // Generar con: openssl rand -base64 32
    version: process.env.API_VERSION || '1',
  },

  // LLM - API key desde variable de entorno
  llm: {
    apiKey: process.env.LLM_APIKEY,
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
  },
};

// Validar que las variables criticas existen al iniciar
const required = ['POSTGRES_DB_PASSWORD', 'JWT_SECRET', 'API_TOKEN'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variable de entorno ${key} es requerida`);
  }
}
