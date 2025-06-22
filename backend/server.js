const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const packagesRouter = require('./routes/packages');
const alertsRouter = require('./routes/alerts');
const claimsRouter = require('./routes/claims');
const preregistrationsRouter = require('./routes/preregistrations');
const returnsRouter = require('./routes/returns');

// Configurar zona horaria de Bolivia
process.env.TZ = 'America/La_Paz';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API de Boa Tracking funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      packages: '/api/packages',
      claims: '/api/claims',
      alerts: '/api/alerts'
    }
  });
});

// Ruta para la página de reset de contraseña
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// Rutas de la API
app.use('/api/users', require('./routes/users'));
app.use('/api/packages', packagesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/claims', claimsRouter);
app.use('/api/preregistrations', preregistrationsRouter);
app.use('/api/returns', returnsRouter);

// --- Lógica de Alertas Automáticas ---

const CHECK_INTERVAL_MS = 1000 * 60 * 30; // 30 minutos

async function checkDelayedPackages() {
    console.log(`[${new Date().toISOString()}] Ejecutando chequeo de paquetes retrasados...`);

    const sql = `
        SELECT id, tracking_number, updated_at
        FROM packages
    `;

    db.all(sql, [], async (err, packages) => {
        if (err) {
            console.error('[Error] No se pudieron obtener los paquetes para el chequeo:', err.message);
            return;
        }

        const now = new Date();

        for (const pkg of packages) {
            const updatedAt = new Date(pkg.updated_at);
            const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

            let severity = null;
            if (hoursDiff >= 4) {
                severity = 'critical';
            } else if (hoursDiff >= 3) {
                severity = 'high';
            } else if (hoursDiff >= 2) {
                severity = 'medium';
            }

            if (severity) {
                const alertTitle = `Retraso - ${severity.charAt(0).toUpperCase() + severity.slice(1)}`;
                const alertDescription = `El paquete ${pkg.tracking_number} tiene un retraso de más de ${Math.floor(hoursDiff)} horas.`;

                // Verificar si ya existe una alerta activa o solucionada para este paquete
                db.get(
                    "SELECT id, status FROM alerts WHERE package_tracking = ? AND alert_type = 'internal_monitoring'",
                    [pkg.tracking_number],
                    (err, existingAlert) => {
                        if (err) {
                           console.error(`[Error] No se pudo verificar la alerta para ${pkg.tracking_number}:`, err.message);
                           return;
                        }

                        if (!existingAlert) {
                            // Si no existe ninguna alerta para este paquete, la creamos
                            db.run(
                                `INSERT INTO alerts (user_email, package_tracking, alert_type, title, description, severity, status)
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                ['system', pkg.tracking_number, 'internal_monitoring', alertTitle, alertDescription, severity, 'active'],
                                (err) => {
                                    if (err) {
                                        console.error(`[Error] No se pudo crear la alerta para ${pkg.tracking_number}:`, err.message);
                                    } else {
                                        console.log(`[Alerta Creada] Paquete ${pkg.tracking_number} con retraso (${severity}).`);
                                    }
                                }
                            );
                        } else if (existingAlert.status === 'solved') {
                            // Si existe una alerta solucionada, no crear una nueva para evitar duplicados
                            console.log(`[Alerta Omitida] Paquete ${pkg.tracking_number} ya tuvo una alerta solucionada anteriormente.`);
                        } else {
                            // Si existe una alerta activa, no crear duplicado
                            console.log(`[Alerta Existente] Paquete ${pkg.tracking_number} ya tiene una alerta activa.`);
                        }
                    }
                );
            }
        }
    });
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  // Iniciar el chequeo periódico
  setInterval(checkDelayedPackages, CHECK_INTERVAL_MS);
  checkDelayedPackages(); // Ejecutar una vez al iniciar
}); 