const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las alertas
router.get('/', (req, res) => {
  db.all(`
    SELECT a.*, p.description as package_description
    FROM alerts a
    LEFT JOIN packages p ON a.package_tracking = p.tracking_number
    ORDER BY a.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener alertas por usuario
router.get('/user/:email', (req, res) => {
  const { email } = req.params;
  
  db.all(
    `SELECT a.*, p.description as package_description
     FROM alerts a
     LEFT JOIN packages p ON a.package_tracking = p.tracking_number
     WHERE a.user_email = ?
     ORDER BY a.created_at DESC`,
    [email],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Crear nueva alerta
router.post('/', (req, res) => {
  const {
    user_email,
    package_tracking,
    alert_type,
    sms_enabled = false,
    email_enabled = false,
    push_enabled = false
  } = req.body;

  if (!user_email || !alert_type) {
    res.status(400).json({ error: 'Email y tipo de alerta son requeridos' });
    return;
  }

  db.run(
    `INSERT INTO alerts (user_email, package_tracking, alert_type, sms_enabled, email_enabled, push_enabled) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_email, package_tracking, alert_type, sms_enabled, email_enabled, push_enabled],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        id: this.lastID,
        user_email,
        alert_type,
        message: 'Alerta configurada exitosamente'
      });
    }
  );
});

// Actualizar configuración de alerta
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    sms_enabled,
    email_enabled,
    push_enabled
  } = req.body;

  db.run(
    `UPDATE alerts 
     SET sms_enabled = ?, email_enabled = ?, push_enabled = ?
     WHERE id = ?`,
    [sms_enabled, email_enabled, push_enabled, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Alerta no encontrada' });
        return;
      }
      res.json({ message: 'Configuración actualizada exitosamente' });
    }
  );
});

// Marcar una alerta como solucionada
router.put('/:id/solve', (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE alerts SET status = 'solved', solved_at = datetime('now') WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Alerta no encontrada' });
      }
      res.json({ message: 'Alerta marcada como solucionada.' });
    }
  );
});

// Verificar si se puede reactivar una alerta para un tracking number
router.get('/can-reactivate/:trackingNumber', (req, res) => {
  const { trackingNumber } = req.params;
  
  db.get(
    `SELECT id, status, solved_at, created_at 
     FROM alerts 
     WHERE package_tracking = ? AND alert_type = 'internal_monitoring' 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [trackingNumber],
    (err, alert) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!alert) {
        return res.json({ canReactivate: true, reason: 'No hay alertas previas' });
      }
      
      if (alert.status === 'active') {
        return res.json({ canReactivate: false, reason: 'Ya existe una alerta activa' });
      }
      
      if (alert.status === 'solved') {
        const solvedAt = new Date(alert.solved_at);
        const now = new Date();
        const hoursSinceSolved = (now.getTime() - solvedAt.getTime()) / (1000 * 60 * 60);
        
        // Permitir reactivar después de 24 horas
        if (hoursSinceSolved >= 24) {
          return res.json({ 
            canReactivate: true, 
            reason: `Han pasado ${Math.floor(hoursSinceSolved)} horas desde la última solución`,
            lastSolvedAt: alert.solved_at
          });
        } else {
          return res.json({ 
            canReactivate: false, 
            reason: `Deben pasar al menos 24 horas desde la última solución (${Math.floor(24 - hoursSinceSolved)} horas restantes)`,
            lastSolvedAt: alert.solved_at
          });
        }
      }
      
      return res.json({ canReactivate: true, reason: 'Estado desconocido' });
    }
  );
});

// Eliminar alerta
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM alerts WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Alerta no encontrada' });
        return;
      }
      res.json({ message: 'Alerta eliminada exitosamente' });
    }
  );
});

// Obtener alertas por tipo
router.get('/type/:alertType', (req, res) => {
  const { alertType } = req.params;
  const { status } = req.query; // 'active', 'solved', o undefined para todas

  let sql = `
    SELECT a.*, p.description as package_description
    FROM alerts a
    LEFT JOIN packages p ON a.package_tracking = p.tracking_number
    WHERE a.alert_type = ?
  `;
  
  const params = [alertType];

  if (status && (status === 'active' || status === 'solved')) {
    sql += ' AND a.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY a.created_at DESC';

  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

module.exports = router; 