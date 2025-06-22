const express = require('express');
const router = express.Router();
const db = require('../db');

// --- Lógica de Devoluciones ---

// 1. Crear una nueva solicitud de devolución
router.post('/request', (req, res) => {
    const { user_email, tracking_number, first_name, last_name, reason } = req.body;

    if (!user_email || !tracking_number || !first_name || !last_name || !reason) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    // Verificar el estado del paquete
    db.get('SELECT status, cost FROM packages WHERE tracking_number = ?', [tracking_number], (err, pkg) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar el paquete.' });
        }
        if (!pkg) {
            return res.status(404).json({ error: 'El número de tracking no fue encontrado.' });
        }
        
        // Regla de negocio: no se puede devolver si ya fue clasificado o está en un estado posterior
        if (pkg.status !== 'received' && pkg.status !== 'pending') {
            return res.status(400).json({ error: `No se puede solicitar la devolución. Estado actual: ${pkg.status}.` });
        }

        // Si es elegible, crear la solicitud
        const sql = `INSERT INTO return_requests (user_email, package_tracking_number, first_name, last_name, reason)
                     VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [user_email, tracking_number, first_name, last_name, reason], function(err) {
            if (err) {
                return res.status(500).json({ error: 'No se pudo crear la solicitud de devolución.' });
            }
            res.status(201).json({ message: 'Solicitud de devolución enviada con éxito.', requestId: this.lastID });
        });
    });
});

// 2. Obtener todas las solicitudes de devolución (para el admin)
router.get('/requests', (req, res) => {
    const { status } = req.query; // Filtrar por status: 'pending', 'approved', 'rejected'
    
    let sql = 'SELECT * FROM return_requests';
    const params = [];

    if (status) {
        sql += ' WHERE status = ?';
        params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las solicitudes de devolución.' });
        }
        res.json(rows);
    });
});

// 3. Aprobar una solicitud de devolución
router.put('/requests/:id/approve', (req, res) => {
    const { id } = req.params;
    const newReturnTrackingNumber = `RTN-${Date.now()}`;

    db.get('SELECT * FROM return_requests WHERE id = ?', [id], (err, request) => {
        if (err || !request) return res.status(404).json({ error: 'Solicitud no encontrada.' });
        
        // Mover paquete a la tabla 'returns' y luego borrarlo de 'packages'
        db.get('SELECT * FROM packages WHERE tracking_number = ?', [request.package_tracking_number], (err, pkg) => {
            if (err || !pkg) return res.status(404).json({ error: 'Paquete original no encontrado.' });

            db.serialize(() => {
                db.run(
                    `INSERT INTO returns (original_tracking_number, return_tracking_number, description, sender_name, recipient_name, origin, destination, weight, cost) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [pkg.tracking_number, newReturnTrackingNumber, pkg.description, pkg.sender_name, pkg.recipient_name, pkg.origin, pkg.destination, pkg.weight, pkg.cost]
                );
                db.run('DELETE FROM packages WHERE tracking_number = ?', [request.package_tracking_number]);
                db.run(
                    "UPDATE return_requests SET status = 'approved', return_tracking_number = ?, updated_at = datetime('now') WHERE id = ?",
                    [newReturnTrackingNumber, id],
                    (err) => {
                        if (err) return res.status(500).json({ error: 'Error al aprobar la solicitud.' });
                        res.json({ message: 'Devolución aprobada con éxito.', return_tracking_number: newReturnTrackingNumber });
                    }
                );
            });
        });
    });
});

// 4. Rechazar una solicitud de devolución
router.put('/requests/:id/reject', (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) return res.status(400).json({ error: 'El motivo del rechazo es requerido.' });

    const sql = "UPDATE return_requests SET status = 'rejected', rejection_comment = ?, updated_at = datetime('now') WHERE id = ?";
    db.run(sql, [comment, id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al rechazar la solicitud.' });
        if (this.changes === 0) return res.status(404).json({ error: 'Solicitud no encontrada.' });
        res.json({ message: 'Solicitud de devolución rechazada.' });
    });
});

// 5. Obtener devoluciones de un usuario específico
router.get('/user/:email', (req, res) => {
    const { email } = req.params;
    // Se usa un alias para que `package_tracking_number` coincida con `original_tracking_number` esperado por el frontend
    const sql = `
        SELECT
            id,
            user_email,
            package_tracking_number as original_tracking_number,
            first_name,
            last_name,
            reason,
            status,
            rejection_comment,
            return_tracking_number,
            created_at,
            updated_at
        FROM return_requests 
        WHERE user_email = ? 
        ORDER BY created_at DESC
    `;
    
    db.all(sql, [email], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las devoluciones del usuario.' });
        }
        res.json(rows);
    });
});

module.exports = router; 