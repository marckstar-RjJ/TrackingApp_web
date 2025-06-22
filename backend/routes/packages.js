const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los paquetes
router.get('/', (req, res) => {
  db.all(`
    SELECT p.*, 
           COUNT(te.id) as events_count,
           MAX(te.timestamp) as last_event_time
    FROM packages p
    LEFT JOIN tracking_events te ON p.id = te.package_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener paquete por número de tracking
router.get('/tracking/:trackingNumber', (req, res) => {
  const { trackingNumber } = req.params;
  
  db.get(
    'SELECT * FROM packages WHERE tracking_number = ?',
    [trackingNumber],
    (err, package) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!package) {
        res.status(404).json({ error: 'Paquete no encontrado' });
        return;
      }
      
      // Obtener eventos del paquete
      db.all(
        'SELECT * FROM tracking_events WHERE package_id = ? ORDER BY timestamp DESC',
        [package.id],
        (err, events) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          res.json({
            ...package,
            events: events
          });
        }
      );
    }
  );
});

// Crear nuevo paquete
router.post('/', (req, res) => {
  const {
    tracking_number,
    description,
    sender_name,
    sender_email,
    sender_phone,
    recipient_name,
    recipient_email,
    recipient_phone,
    origin,
    destination,
    weight,
    priority = 'normal',
    cost,
    estimated_delivery_date
  } = req.body;

  console.log('Datos recibidos en el backend:', req.body);
  console.log('Origin recibido:', origin);
  console.log('Destination recibido:', destination);

  if (!tracking_number) {
    res.status(400).json({ error: 'Número de tracking es requerido' });
    return;
  }

  db.run(
    `INSERT INTO packages (
      tracking_number, description, sender_name, sender_email, sender_phone,
      recipient_name, recipient_email, recipient_phone, origin, destination, weight, priority, cost,
      estimated_delivery_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tracking_number, description, sender_name, sender_email, sender_phone,
     recipient_name, recipient_email, recipient_phone, origin, destination, weight, priority, cost,
     estimated_delivery_date
    ],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'El número de tracking ya existe' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      
      res.json({
        id: this.lastID,
        tracking_number,
        message: 'Paquete creado exitosamente'
      });
    }
  );
});

// Actualizar estado del paquete
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, location } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Estado es requerido' });
    return;
  }

  db.run(
    'UPDATE packages SET status = ?, location = ?, updated_at = datetime(\'now\') WHERE id = ?',
    [status, location, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Paquete no encontrado' });
        return;
      }
      res.json({ message: 'Estado actualizado exitosamente' });
    }
  );
});

// Obtener paquetes por usuario (email)
router.get('/user/:email', (req, res) => {
  const { email } = req.params;
  
  db.all(
    `SELECT p.*, 
            COUNT(te.id) as events_count,
            MAX(te.timestamp) as last_event_time
     FROM packages p
     LEFT JOIN tracking_events te ON p.id = te.package_id
     WHERE p.sender_email = ? OR p.recipient_email = ?
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [email, email],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Obtener un paquete por número de tracking
router.get('/:trackingNumber', (req, res) => {
  const { trackingNumber } = req.params;
  
  db.get(
    'SELECT * FROM packages WHERE tracking_number = ?',
    [trackingNumber],
    (err, package) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!package) {
        res.status(404).json({ error: 'Paquete no encontrado' });
        return;
      }
      
      // Obtener eventos del paquete
      db.all(
        'SELECT * FROM tracking_events WHERE package_id = ? ORDER BY timestamp DESC',
        [package.id],
        (err, events) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          res.json({
            ...package,
            events: events
          });
        }
      );
    }
  );
});

// Nueva ruta para verificar si un paquete es elegible para devolución
router.get('/check-return/:trackingNumber', (req, res) => {
    const { trackingNumber } = req.params;

    db.get('SELECT tracking_number, status, cost FROM packages WHERE tracking_number = ?', [trackingNumber], (err, pkg) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos.' });
        }
        if (!pkg) {
            return res.status(404).json({ error: 'El número de tracking no existe.' });
        }

        const elegibleStatus = ['received', 'pending'];
        const isElegible = elegibleStatus.includes(pkg.status);

        res.json({
            elegible: isElegible,
            tracking_number: pkg.tracking_number,
            status: pkg.status,
            cost: pkg.cost
        });
    });
});

// Ruta para añadir un evento de tracking a un paquete
router.post('/events', (req, res) => {
    const { 
        package_tracking, 
        event_type, 
        location, 
        operator, 
        notes,
        timestamp
    } = req.body;

    if (!package_tracking || !event_type || !location) {
        return res.status(400).json({ error: 'Faltan campos requeridos (tracking, tipo de evento, ubicación).' });
    }

    // 1. Encontrar el ID del paquete
    db.get('SELECT id FROM packages WHERE tracking_number = ?', [package_tracking], (err, pkg) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar el paquete.' });
        }
        if (!pkg) {
            return res.status(404).json({ error: 'Paquete no encontrado.' });
        }

        const packageId = pkg.id;

        // 2. Insertar el nuevo evento con timestamp del frontend
        const eventSql = `
            INSERT INTO tracking_events (package_id, event_type, location, operator, notes, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const eventTimestamp = timestamp ? new Date(timestamp).toISOString().replace('T', ' ').replace('Z', '') : null;
        db.run(eventSql, [packageId, event_type, location, operator, notes, eventTimestamp], function (err) {
            if (err) {
                return res.status(500).json({ error: 'No se pudo registrar el evento de tracking.' });
            }

            // 3. Actualizar el estado principal del paquete
            db.run('UPDATE packages SET status = ?, location = ?, updated_at = datetime(\'now\') WHERE id = ?', [event_type, location, packageId], (err) => {
                if (err) {
                    // Si esto falla, el evento ya se creó, pero es mejor notificarlo.
                    return res.status(500).json({ error: 'Evento registrado, pero no se pudo actualizar el estado del paquete.' });
                }
                res.status(201).json({ message: 'Evento registrado y paquete actualizado con éxito.', eventId: this.lastID });
            });
        });
    });
});

// Actualizar evento de tracking
router.put('/events/:id', (req, res) => {
  const { id } = req.params;
  const { event_type, location, notes, operator, coordinates } = req.body;

  console.log('Actualizando evento:', { id, event_type, location, notes, operator, coordinates });

  if (!event_type || !location) {
    res.status(400).json({ error: 'Tipo de evento y ubicación son requeridos' });
    return;
  }

  db.run(
    `UPDATE tracking_events 
     SET event_type = ?, location = ?, notes = ?, operator = ?, coordinates = ?
     WHERE id = ?`,
    [event_type, location, notes || null, operator || null, coordinates ? JSON.stringify(coordinates) : null, id],
    function(err) {
      if (err) {
        console.error('Error actualizando evento:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }
      console.log('Evento actualizado exitosamente, cambios:', this.changes);
      res.json({ message: 'Evento actualizado exitosamente' });
    }
  );
});

// Eliminar evento de tracking
router.delete('/events/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM tracking_events WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error('Error eliminando evento:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }
      res.json({ message: 'Evento eliminado exitosamente' });
    }
  );
});

module.exports = router; 