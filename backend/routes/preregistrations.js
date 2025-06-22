const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/preregistrations - Crear un nuevo pre-registro
router.post('/', (req, res) => {
  const { user_email, description, sender_name, recipient_name } = req.body;

  if (!user_email || !description || !sender_name || !recipient_name) {
    return res.status(400).json({ error: 'Faltan campos requeridos. Asegúrate de incluir al menos email, descripción, y nombres de remitente y destinatario.' });
  }

  db.createPreregistration(req.body, (err, result) => {
    if (err) {
      console.error('Error al crear el pre-registro:', err);
      return res.status(500).json({ error: 'Error interno del servidor al crear el pre-registro.' });
    }
    res.status(201).json({ message: 'Pre-registro creado exitosamente', preregistrationId: result.id });
  });
});

// RUTA NUEVA: Obtener todos los pre-registros (para Admin) - DEBE IR ANTES DE /:userEmail
router.get('/all', (req, res) => {
  const { search = '', status } = req.query;

  let sql = `
    SELECT 
      pr.id,
      pr.preregistration_tracking_number as trackingNumber,
      pr.sender_name, pr.sender_email, pr.sender_phone, pr.sender_address,
      pr.recipient_name, pr.recipient_phone, pr.recipient_address, pr.recipient_email,
      pr.weight, pr.cargo_type, pr.origin_city, pr.destination_city,
      pr.description, pr.priority, pr.shipping_type, pr.cost,
      pr.estimated_delivery_date, pr.user_email, pr.created_at,
      pr.status, pr.approved_at, pr.approved_tracking_number
    FROM preregistrations pr
  `;
  
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push(`pr.preregistration_tracking_number LIKE ?`);
    params.push(`%${search}%`);
  }
  
  if (status && status === 'Aprobado') {
    conditions.push(`TRIM(pr.status) = ?`);
    params.push('Aprobado');
  } else if (status && status === 'Pendiente') {
    conditions.push(`(TRIM(pr.status) != 'Aprobado' OR pr.status IS NULL)`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ' ORDER BY pr.created_at DESC';

  console.log('SQL Query:', sql);
  console.log('Search params:', params);

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Found rows:', rows.length);
    res.json(rows);
  });
});

// GET /api/preregistrations/:userEmail - Obtener pre-registros por email de usuario
router.get('/:userEmail', (req, res) => {
  const { userEmail } = req.params;

  db.getPreregistrationsByUserEmail(userEmail, (err, preregistrations) => {
    if (err) {
      console.error('Error al obtener los pre-registros:', err);
      return res.status(500).json({ error: 'Error interno del servidor al obtener los pre-registros.' });
    }
    res.json(preregistrations);
  });
});

// PUT /api/preregistrations/:id - Actualizar un pre-registro
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { sender_name, sender_email, recipient_name, recipient_email, weight } = req.body;

  console.log('📝 Actualizando preregistro ID:', id);
  console.log('📝 Datos recibidos:', { sender_name, sender_email, recipient_name, recipient_email, weight });

  // Validar que los campos requeridos estén presentes
  if (!sender_name || !recipient_name || weight === undefined) {
    console.log('❌ Validación fallida: campos requeridos faltantes');
    return res.status(400).json({ error: 'Faltan campos requeridos: sender_name, recipient_name, weight' });
  }

  // Calcular el nuevo precio basado en el peso
  let cost = 0;
  if (weight <= 1) {
    cost = 15;
  } else if (weight <= 3) {
    cost = 25;
  } else if (weight <= 5) {
    cost = 35;
  } else if (weight <= 10) {
    cost = 50;
  } else {
    cost = 50 + (Math.ceil(weight - 10) * 5);
  }

  console.log('💰 Costo calculado:', cost);

  const sql = `
    UPDATE preregistrations 
    SET sender_name = ?, sender_email = ?, recipient_name = ?, recipient_email = ?, weight = ?, cost = ?
    WHERE id = ?
  `;

  const params = [sender_name, sender_email, recipient_name, recipient_email, weight, cost, id];
  console.log('🔍 SQL Query:', sql);
  console.log('🔍 Parámetros:', params);

  db.run(sql, params, function (err) {
    if (err) {
      console.error('❌ Error en la base de datos:', err.message);
      console.error('❌ Error completo:', err);
      return res.status(500).json({ error: 'Error interno del servidor al actualizar el pre-registro.' });
    }
    
    console.log('✅ Filas afectadas:', this.changes);
    
    if (this.changes === 0) {
      console.log('❌ No se encontró el preregistro con ID:', id);
      return res.status(404).json({ error: 'Pre-registro no encontrado.' });
    }
    
    console.log('✅ Preregistro actualizado exitosamente');
    res.json({ 
      message: 'Pre-registro actualizado exitosamente',
      updatedFields: { sender_name, sender_email, recipient_name, recipient_email, weight, cost }
    });
  });
});

// DELETE /api/preregistrations/:id - Eliminar un pre-registro
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM preregistrations WHERE id = ?';

  db.run(sql, [id], function (err) {
    if (err) {
      console.error('Error al eliminar el pre-registro:', err);
      return res.status(500).json({ error: 'Error interno del servidor al eliminar el pre-registro.' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pre-registro no encontrado.' });
    }
    
    res.json({ message: 'Pre-registro eliminado exitosamente' });
  });
});

// POST /api/preregistrations/:id/approve - Aceptar un pre-registro y convertirlo en paquete
router.post('/:id/approve', (req, res) => {
  const { id } = req.params;
  
  console.log('🚀 Aceptando preregistro ID:', id);

  // Primero, obtener los datos del preregistro
  const getPreregistrationSql = 'SELECT * FROM preregistrations WHERE id = ?';
  
  db.get(getPreregistrationSql, [id], (err, preregistration) => {
    if (err) {
      console.error('❌ Error al obtener el preregistro:', err);
      return res.status(500).json({ error: 'Error interno del servidor al obtener el pre-registro.' });
    }
    
    if (!preregistration) {
      console.log('❌ Preregistro no encontrado con ID:', id);
      return res.status(404).json({ error: 'Pre-registro no encontrado.' });
    }

    console.log('📋 Datos del preregistro:', preregistration);

    // Generar número de tracking real (formato: BOA-YYYY-XXXX)
    const currentYear = new Date().getFullYear();
    const trackingNumber = `BOA-${currentYear}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    console.log('🏷️ Nuevo número de tracking:', trackingNumber);

    // Insertar en la tabla de paquetes
    const insertPackageSql = `
      INSERT INTO packages (
        tracking_number, 
        description, 
        sender_name, 
        sender_phone,
        sender_address,
        sender_email, 
        recipient_name, 
        recipient_phone,
        recipient_address,
        recipient_email, 
        weight, 
        cost, 
        status, 
        user_email,
        origin,
        destination,
        estimated_delivery_date,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    const packageParams = [
      trackingNumber,
      preregistration.description,
      preregistration.sender_name,
      preregistration.sender_phone,
      preregistration.sender_address,
      preregistration.sender_email,
      preregistration.recipient_name,
      preregistration.recipient_phone,
      preregistration.recipient_address,
      preregistration.recipient_email,
      preregistration.weight,
      preregistration.cost,
      'En proceso',
      preregistration.user_email,
      preregistration.origin_city,
      preregistration.destination_city,
      preregistration.estimated_delivery_date
    ];

    console.log('📦 Insertando paquete con parámetros:', packageParams);

    db.run(insertPackageSql, packageParams, function (err) {
      if (err) {
        console.error('❌ Error al insertar el paquete:', err);
        return res.status(500).json({ error: 'Error interno del servidor al crear el paquete.' });
      }

      const packageId = this.lastID;
      console.log('✅ Paquete creado con ID:', packageId);

      // Actualizar el preregistro como aprobado
      const updatePreregistrationSql = `
        UPDATE preregistrations 
        SET status = 'Aprobado', 
            approved_at = datetime('now'),
            approved_tracking_number = ?
        WHERE id = ?
      `;

      db.run(updatePreregistrationSql, [trackingNumber, id], function (err) {
        if (err) {
          console.error('❌ Error al actualizar el preregistro:', err);
          return res.status(500).json({ error: 'Error interno del servidor al actualizar el pre-registro.' });
        }

        console.log('✅ Preregistro marcado como aprobado');

        // Respuesta exitosa
        res.json({
          message: 'Pre-registro aprobado exitosamente',
          trackingNumber: trackingNumber,
          packageId: packageId,
          preregistrationId: id
        });
      });
    });
  });
});

module.exports = router; 