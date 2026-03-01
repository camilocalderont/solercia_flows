// ❌ INCORRECTO: Credenciales hardcoded en codigo fuente
// Este archivo muestra TODOS los anti-patrones de seguridad

// ❌ API key hardcoded
const OPENAI_KEY = 'sk-proj-j6pBZ1234567890abcdef';

// ❌ Password de base de datos hardcoded
const DB_CONFIG = {
  host: '192.168.1.100',          // ❌ IP fija
  password: 'SO5!2025',           // ❌ Password en codigo
  database: 'boki',
};

// ❌ Token de Meta hardcoded
const META_TOKEN = 'EAAZALxyz123456789';

// ❌ JWT secret debil y hardcoded
const JWT_SECRET = 'mi-secreto';  // ❌ Facil de adivinar

// ❌ CORS abierto a todos
app.enableCors();                  // ❌ Cualquier origen puede acceder

// ❌ Sin expiracion de JWT
const token = jwt.sign(payload, JWT_SECRET); // ❌ Token nunca expira

// ❌ MONGO URI con credenciales hardcoded
const MONGO_URI = 'mongodb://admin:admin123F@mongo_db:27017/boki_mongo';

// ❌ SQL con interpolacion directa de input de usuario
const query = `SELECT * FROM "Client" WHERE vc_phone = '${userPhone}'`;
// Un atacante puede enviar: ' OR 1=1 --
// Resultado: SELECT * FROM "Client" WHERE vc_phone = '' OR 1=1 --'
// Esto retorna TODOS los clientes
