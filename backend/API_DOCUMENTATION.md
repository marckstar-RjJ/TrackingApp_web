# 📚 Documentación API - Boa Tracking Backend

## 🚀 Información General

- **URL Base**: `http://localhost:3000`
- **Base de Datos**: SQLite (`boa.db`)
- **Puerto**: 3000

## 📊 Endpoints Disponibles

### 🔐 Autenticación y Usuarios

#### `GET /api/users`
Obtener todos los usuarios
```json
{
  "id": 1,
  "name": "Admin Boa",
  "email": "huancarodrigo1@gmail.com",
  "role": "admin",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/users/login`
Autenticar usuario
```json
{
  "email": "huancarodrigo1@gmail.com",
  "password": "admin123"
}
```

#### `POST /api/users`
Crear nuevo usuario
```json
{
  "name": "Nuevo Usuario",
  "email": "usuario@example.com",
  "password": "password123",
  "role": "public"
}
```

### 📦 Paquetes

#### `GET /api/packages`
Obtener todos los paquetes
```json
{
  "id": 1,
  "tracking_number": "BOA-2024-001",
  "description": "Documentos importantes",
  "status": "in_flight",
  "location": "Aeropuerto Internacional El Alto",
  "sender_name": "Juan Pérez",
  "recipient_name": "María López",
  "origin": "Santa Cruz",
  "destination": "La Paz",
  "events_count": 2,
  "last_event_time": "2024-01-01T10:00:00.000Z"
}
```

#### `GET /api/packages/tracking/:trackingNumber`
Obtener paquete por número de tracking
```json
{
  "id": 1,
  "tracking_number": "BOA-2024-001",
  "description": "Documentos importantes",
  "status": "in_flight",
  "location": "Aeropuerto Internacional El Alto",
  "events": [
    {
      "id": 1,
      "event_type": "in_flight",
      "description": "En vuelo a La Paz",
      "location": "Aeropuerto Internacional El Alto",
      "timestamp": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

#### `POST /api/packages`
Crear nuevo paquete
```json
{
  "tracking_number": "BOA-2024-004",
  "description": "Nuevo paquete",
  "sender_name": "Remitente",
  "sender_email": "remitente@example.com",
  "recipient_name": "Destinatario",
  "recipient_email": "destinatario@example.com",
  "origin": "Santa Cruz",
  "destination": "La Paz"
}
```

#### `GET /api/packages/user/:email`
Obtener paquetes por usuario
```json
[
  {
    "id": 1,
    "tracking_number": "BOA-2024-001",
    "description": "Documentos importantes",
    "status": "in_flight",
    "sender_email": "usuario@example.com"
  }
]
```

### 📋 Eventos de Tracking

#### `GET /api/events`
Obtener todos los eventos
```json
{
  "id": 1,
  "package_id": 1,
  "event_type": "in_flight",
  "description": "En vuelo a La Paz",
  "location": "Aeropuerto Internacional El Alto",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "tracking_number": "BOA-2024-001",
  "package_description": "Documentos importantes"
}
```

#### `POST /api/events`
Crear nuevo evento
```json
{
  "package_tracking": "BOA-2024-001",
  "event_type": "delivered",
  "description": "Paquete entregado",
  "location": "Oficina Central, La Paz",
  "operator": "María López"
}
```

#### `GET /api/events/package/:packageId`
Obtener eventos por paquete

#### `GET /api/events/type/:eventType`
Obtener eventos por tipo

### 🚨 Reclamos y Soporte

#### `GET /api/claims`
Obtener todos los reclamos
```json
{
  "id": 1,
  "user_email": "usuario@example.com",
  "package_tracking": "BOA-2024-001",
  "type": "delayed",
  "description": "Mi paquete está retrasado",
  "status": "pendiente",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/claims`
Crear nuevo reclamo
```json
{
  "user_email": "usuario@example.com",
  "package_tracking": "BOA-2024-001",
  "type": "delayed",
  "description": "Mi paquete está retrasado"
}
```

#### `GET /api/claims/user/:email`
Obtener reclamos por usuario

### 🔔 Alertas

#### `GET /api/alerts`
Obtener todas las alertas
```json
{
  "id": 1,
  "user_email": "usuario@example.com",
  "package_tracking": "BOA-2024-001",
  "alert_type": "status_change",
  "sms_enabled": true,
  "email_enabled": true,
  "push_enabled": false
}
```

#### `POST /api/alerts`
Crear nueva alerta
```json
{
  "user_email": "usuario@example.com",
  "package_tracking": "BOA-2024-001",
  "alert_type": "status_change",
  "sms_enabled": true,
  "email_enabled": true,
  "push_enabled": false
}
```

## 🗄️ Estructura de la Base de Datos

### Tabla: `users`
- `id` (INTEGER, PRIMARY KEY)
- `name` (VARCHAR(100))
- `email` (VARCHAR(100), UNIQUE)
- `password` (VARCHAR(100))
- `role` (VARCHAR(20))
- `created_at` (DATETIME)

### Tabla: `packages`
- `id` (INTEGER, PRIMARY KEY)
- `tracking_number` (VARCHAR(50), UNIQUE)
- `description` (TEXT)
- `status` (VARCHAR(50))
- `location` (VARCHAR(100))
- `sender_name`, `sender_email`, `sender_phone`
- `recipient_name`, `recipient_email`, `recipient_phone`
- `origin`, `destination`
- `weight` (DECIMAL(10,2))
- `priority` (VARCHAR(20))
- `created_at`, `updated_at` (DATETIME)

### Tabla: `tracking_events`
- `id` (INTEGER, PRIMARY KEY)
- `package_id` (INTEGER, FOREIGN KEY)
- `event_type` (VARCHAR(50))
- `description` (TEXT)
- `location` (VARCHAR(100))
- `timestamp` (DATETIME)
- `operator` (VARCHAR(100))
- `flight_number` (VARCHAR(20))
- `airline` (VARCHAR(50))
- `next_destination` (VARCHAR(100))
- `notes` (TEXT)

### Tabla: `claims`
- `id` (INTEGER, PRIMARY KEY)
- `user_email` (VARCHAR(100))
- `package_tracking` (VARCHAR(50))
- `type` (VARCHAR(50))
- `description` (TEXT)
- `status` (VARCHAR(50))
- `created_at`, `updated_at` (DATETIME)

### Tabla: `alerts`
- `id` (INTEGER, PRIMARY KEY)
- `user_email` (VARCHAR(100))
- `package_tracking` (VARCHAR(50))
- `alert_type` (VARCHAR(50))
- `sms_enabled` (BOOLEAN)
- `email_enabled` (BOOLEAN)
- `push_enabled` (BOOLEAN)
- `created_at` (DATETIME)

## 🚀 Cómo Usar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

### 3. Conectar desde HeidiSQL
- **Tipo**: SQLite
- **Archivo**: `C:\Proyecto Boa\BoaTrackingApp-New\backend\boa.db`

### 4. Probar API
```bash
# Verificar que funciona
curl http://localhost:3000

# Obtener paquetes
curl http://localhost:3000/api/packages

# Buscar paquete específico
curl http://localhost:3000/api/packages/tracking/BOA-2024-001
```

## 📱 Integración con React Native

### Configurar en tu app:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';

// Ejemplo de uso
const response = await fetch(`${API_BASE_URL}/packages/tracking/BOA-2024-001`);
const package = await response.json();
```

## 🔄 Migración a Azure SQL Database

Para migrar a Azure SQL Database:

1. **Instalar driver de SQL Server**:
```bash
npm uninstall sqlite3
npm install mssql
```

2. **Actualizar conexión en server.js**:
```javascript
const sql = require('mssql');

const config = {
  user: 'your_username',
  password: 'your_password',
  server: 'your_server.database.windows.net',
  database: 'your_database',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};
```

3. **Ejecutar scripts SQL** en Azure SQL Database (los mismos que están en initDatabase())

## 🎯 Próximos Pasos

1. ✅ Backend funcional con SQLite
2. 🔄 Conectar React Native app al backend
3. 🚀 Migrar a Azure SQL Database
4. 🔐 Implementar autenticación JWT
5. 📧 Configurar notificaciones reales
6. 📊 Dashboard de administración 