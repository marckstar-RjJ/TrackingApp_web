const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los reclamos
router.get('/', (req, res) => {
  db.all(`
    SELECT c.*, p.description as package_description
    FROM claims c
    LEFT JOIN packages p ON c.tracking_number = p.tracking_number
    ORDER BY c.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener reclamos por usuario
router.get('/user/:email', (req, res) => {
  const { email } = req.params;
  
  db.all(
    `SELECT * FROM claims WHERE email = ? ORDER BY created_at DESC`,
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

// Crear nuevo reclamo
router.post('/', (req, res) => {
  const {
    tracking_number,
    name,
    email,
    claim_type,
    description,
  } = req.body;

  if (!name || !email || !claim_type || !description) {
    return res.status(400).json({ error: 'Faltan campos requeridos: nombre, email, tipo de reclamo y descripción.' });
  }

  db.createClaim(
    tracking_number,
    name,
    email,
    claim_type,
    description,
    (err, result) => {
      if (err) {
        console.error('Error al crear el reclamo:', err);
        return res.status(500).json({ error: 'Error interno del servidor al crear el reclamo.' });
      }
      res.status(201).json({ message: 'Reclamo creado exitosamente', claimId: result.id });
    }
  );
});

// Responder a un reclamo
router.put('/:id/respond', (req, res) => {
  const { id } = req.params;
  const { response, admin_name } = req.body;

  if (!response || !admin_name) {
    return res.status(400).json({ error: 'La respuesta y el nombre del administrador son requeridos.' });
  }

  db.run(
    `UPDATE claims 
     SET 
       response = ?, 
       response_by = ?, 
       responded_at = datetime('now'), 
       status = 'Respondido' 
     WHERE id = ?`,
    [response, admin_name, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Reclamo no encontrado' });
      }
      res.json({ message: 'Respuesta enviada exitosamente' });
    }
  );
});

// Actualizar estado del reclamo
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Estado es requerido' });
    return;
  }

  db.run(
    'UPDATE claims SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Reclamo no encontrado' });
        return;
      }
      res.json({ message: 'Estado actualizado exitosamente' });
    }
  );
});

// Obtener reclamos por tipo
router.get('/type/:type', (req, res) => {
  const { type } = req.params;
  
  db.all(
    `SELECT c.*, p.description as package_description
     FROM claims c
     LEFT JOIN packages p ON c.tracking_number = p.tracking_number
     WHERE c.claim_type = ?
     ORDER BY c.created_at DESC`,
    [type],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Obtener reclamos por estado
router.get('/status/:status', (req, res) => {
  const { status } = req.params;
  
  db.all(
    `SELECT c.*, p.description as package_description
     FROM claims c
     LEFT JOIN packages p ON c.tracking_number = p.tracking_number
     WHERE c.status = ?
     ORDER BY c.created_at DESC`,
    [status],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

module.exports = router; 