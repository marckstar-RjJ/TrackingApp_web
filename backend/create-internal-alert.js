const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// --- Configuración de la Alerta de Prueba ---
// Siéntete libre de modificar estos valores para tus pruebas
const testAlert = {
    user_email: 'admin@boasystem.com', // Correo del administrador o un correo de prueba
    package_tracking: 'BOA-20240115-0001', // Un número de tracking que exista en tu tabla 'packages'
    alert_type: 'internal_monitoring', // Usamos un tipo específico para diferenciarla
    title: 'Paquete con Retraso Crítico',
    description: 'Este paquete no ha tenido actualizaciones en más de 48 horas. Requiere investigación inmediata.',
    severity: 'critical' // Puede ser 'critical', 'high', 'medium'
};
// -----------------------------------------

const dbPath = path.join(__dirname, 'boa.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Error al conectar con la base de datos:', err.message);
    }
    console.log('✅ Conectado a la base de datos SQLite.');
    createInternalAlert();
});

function createInternalAlert() {
    // Primero, verificamos si la columna 'title', 'description' y 'severity' existen.
    // Esto es para adaptar la tabla 'alerts' a la estructura que necesita 'InternalAlertsScreen'.
    const columns = ['title', 'description', 'severity'];
    columns.forEach(column => {
        db.run(`ALTER TABLE alerts ADD COLUMN ${column} TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error(`Error al agregar la columna ${column}:`, err.message);
            }
        });
    });

    const { user_email, package_tracking, alert_type, title, description, severity } = testAlert;

    // Usamos un delay para dar tiempo a que las columnas se creen si no existen
    setTimeout(() => {
        const sql = `INSERT INTO alerts (
            user_email, 
            package_tracking, 
            alert_type, 
            title, 
            description, 
            severity,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;

        db.run(sql, [user_email, package_tracking, alert_type, title, description, severity], function(err) {
            if (err) {
                db.close();
                return console.error('Error al crear la alerta interna:', err.message);
            }
            console.log(`✅ Alerta interna de prueba creada con éxito. ID: ${this.lastID}`);
            db.close((err) => {
                if (err) {
                    return console.error('Error al cerrar la base de datos:', err.message);
                }
                console.log('✅ Conexión a la base de datos cerrada.');
            });
        });
    }, 1000); // 1 segundo de espera
} 