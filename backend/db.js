const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configurar zona horaria de Bolivia
process.env.TZ = 'America/La_Paz';

const dbPath = path.join(__dirname, 'boa.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
    console.log('✅ Zona horaria configurada: America/La_Paz');
    // Ejecutar migración para agregar campos de reset de contraseña
    addResetPasswordFields();
    addPreregistrationApprovalFields();
    addClaimResponseFields();
    addAlertsFields();
    addReturnsFields();
    addTrackingEventsTable();
  }
});

// Función para agregar columnas a la tabla de alertas
function addAlertsFields() {
  const alertMigrations = [
      "ALTER TABLE alerts ADD COLUMN status TEXT DEFAULT 'active'",
      "ALTER TABLE alerts ADD COLUMN title TEXT",
      "ALTER TABLE alerts ADD COLUMN description TEXT",
      "ALTER TABLE alerts ADD COLUMN severity TEXT",
      "ALTER TABLE alerts ADD COLUMN solved_at TEXT"
  ];

  alertMigrations.forEach(migration => {
      db.run(migration, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
              console.error('Error en migración de la tabla de alertas:', err.message);
          }
      });
  });
  console.log('✅ Migración de la tabla de alertas completada.');
}

// Función para agregar campos de reset de contraseña
function addResetPasswordFields() {
  db.run(`
    ALTER TABLE users ADD COLUMN reset_token TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando reset_token:', err.message);
    }
  });
  
  db.run(`
    ALTER TABLE users ADD COLUMN reset_token_expiry TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando reset_token_expiry:', err.message);
    }
  });
}

// Nota: La creación de tablas se manejará con un script de migración separado
// para evitar problemas de concurrencia y borrado de datos en cada reinicio.

// Función para crear un nuevo paquete
db.createClaim = (trackingNumber, name, email, claimType, description, callback) => {
  const sql = `INSERT INTO claims (tracking_number, name, email, claim_type, description)
               VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [trackingNumber, name, email, claimType, description], function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID });
  });
};

// Función para crear un nuevo pre-registro
db.createPreregistration = (preregistrationData, callback) => {
  const { 
    user_email, sender_name, sender_phone, sender_address, sender_email,
    recipient_name, recipient_phone, recipient_address, recipient_email,
    weight, cargo_type, origin_city, destination_city, description, priority, shipping_type,
    cost, estimated_delivery_date, preregistration_tracking_number
  } = preregistrationData;

  const sql = `INSERT INTO preregistrations (
    user_email, sender_name, sender_phone, sender_address, sender_email,
    recipient_name, recipient_phone, recipient_address, recipient_email,
    weight, cargo_type, origin_city, destination_city, description, priority, shipping_type,
    cost, estimated_delivery_date, preregistration_tracking_number, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;

  db.run(sql, [
    user_email, sender_name, sender_phone, sender_address, sender_email,
    recipient_name, recipient_phone, recipient_address, recipient_email,
    weight, cargo_type, origin_city, destination_city, description, priority, shipping_type,
    cost, estimated_delivery_date, preregistration_tracking_number
  ], function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID });
  });
};

// Función para obtener pre-registros por email de usuario
db.getPreregistrationsByUserEmail = (userEmail, callback) => {
  const sql = `SELECT *, preregistration_tracking_number as trackingNumber FROM preregistrations WHERE user_email = ?`;
  db.all(sql, [userEmail], (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows);
  });
};

function addPreregistrationApprovalFields() {
  db.run(`
    ALTER TABLE preregistrations ADD COLUMN status TEXT DEFAULT 'Pendiente';
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando status:', err.message);
    } else {
      console.log('✅ Campo status agregado a preregistrations');
    }
  });
  
  db.run(`
    ALTER TABLE preregistrations ADD COLUMN approved_at TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando approved_at:', err.message);
    } else {
      console.log('✅ Campo approved_at agregado a preregistrations');
    }
  });

  db.run(`
    ALTER TABLE preregistrations ADD COLUMN created_at TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando created_at a preregistrations:', err.message);
    } else {
      console.log('✅ Campo created_at agregado a preregistrations');
    }
  });
}

function addClaimResponseFields() {
  db.run(`
    ALTER TABLE claims ADD COLUMN response TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando response:', err.message);
    } else {
      console.log('✅ Campo response agregado a claims');
    }
  });

  db.run(`
    ALTER TABLE claims ADD COLUMN response_by TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando response_by:', err.message);
    } else {
      console.log('✅ Campo response_by agregado a claims');
    }
  });

  db.run(`
    ALTER TABLE claims ADD COLUMN responded_at TEXT;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error agregando responded_at:', err.message);
    } else {
      console.log('✅ Campo responded_at agregado a claims');
    }
  });
}

// Función para crear la tabla de eventos de tracking si no existe
function addTrackingEventsTable() {
    db.run(`
        CREATE TABLE IF NOT EXISTS tracking_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            package_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            location TEXT,
            operator TEXT,
            notes TEXT,
            coordinates TEXT,
            timestamp DATETIME DEFAULT (datetime('now')),
            updated_at DATETIME DEFAULT (datetime('now')),
            FOREIGN KEY (package_id) REFERENCES packages(id)
        );
    `, (err) => {
        if (err) {
            console.error('Error creando la tabla tracking_events:', err.message);
        } else {
            console.log('✅ Tabla tracking_events verificada/creada con éxito.');
            // Agregar columnas si no existen
            addTrackingEventsColumns();
        }
    });
}

// Función para agregar columnas adicionales a tracking_events
function addTrackingEventsColumns() {
    const columns = [
        "ALTER TABLE tracking_events ADD COLUMN coordinates TEXT",
        "ALTER TABLE tracking_events ADD COLUMN updated_at DATETIME DEFAULT (datetime('now'))"
    ];

    columns.forEach(column => {
        db.run(column, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Error agregando columna a tracking_events:', err.message);
            }
        });
    });
    console.log('✅ Columnas adicionales de tracking_events verificadas.');
}

// Función para agregar tablas y campos para el sistema de devoluciones
function addReturnsFields() {
    // Tabla para gestionar las solicitudes de devolución
    db.run(`
        CREATE TABLE IF NOT EXISTS return_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            package_tracking_number TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            rejection_comment TEXT,
            return_tracking_number TEXT,
            created_at DATETIME DEFAULT (datetime('now')),
            updated_at DATETIME DEFAULT (datetime('now'))
        );
    `);

    // Tabla para archivar los paquetes devueltos
    db.run(`
        CREATE TABLE IF NOT EXISTS returns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_tracking_number TEXT,
            return_tracking_number TEXT,
            description TEXT,
            sender_name TEXT,
            recipient_name TEXT,
            origin TEXT,
            destination TEXT,
            weight REAL,
            cost REAL,
            created_at DATETIME DEFAULT (datetime('now'))
        );
    `);
    console.log('✅ Módulo de Devoluciones inicializado en la BD.');
}

module.exports = db; 