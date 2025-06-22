const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../emailService');

// Obtener todos los usuarios
router.get('/', (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener usuario por ID
router.get('/:id', (req, res) => {
  db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(row);
  });
});

// Crear nuevo usuario
router.post('/', (req, res) => {
  const { name, email, password, role = 'public' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }

  // Encriptar la contraseña antes de guardarla
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error al procesar la contraseña' });
    }

    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role], // Guardamos la contraseña encriptada
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'El email ya está registrado' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({
          id: this.lastID,
          name,
          email,
          role,
          message: 'Usuario creado exitosamente'
        });
      }
    );
  });
});

// Autenticar usuario
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  db.get(
    'SELECT id, name, email, password, role FROM users WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error al autenticar' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      // Comparar la contraseña enviada con la encriptada en la BD
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Error al autenticar' });
        }
        if (!isMatch) {
          return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Si la contraseña coincide
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          message: 'Login exitoso'
        });
      });
    }
  );
});

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' });
  }

  db.get('SELECT id, name, email FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Si el usuario no existe, devolvemos una respuesta de éxito genérica para no revelar información
    if (!user) {
      console.log(`Solicitud de recuperación para email no registrado: ${email}`);
      return res.json({ success: true, message: 'Si tu email está registrado, recibirás un correo de recuperación.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    db.run(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry.toISOString(), user.id],
      async function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        try {
          await sendPasswordResetEmail(user.email, resetToken, user.name);
          // Enviamos una respuesta de éxito clara
          res.json({ success: true, message: 'Se han enviado las instrucciones de recuperación a tu email.' });
        } catch (emailError) {
          console.error('Fallo en el envío final del email:', emailError);
          res.status(500).json({ success: false, error: 'No se pudo enviar el email de recuperación.' });
        }
      }
    );
  });
});

// Resetear contraseña con token
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }

  // Buscar usuario con el token válido
  db.get(
    'SELECT id, name, email FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
    [token, new Date().toISOString()],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!user) {
        res.status(400).json({ error: 'Token inválido o expirado' });
        return;
      }

      // Hashear nueva contraseña
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          res.status(500).json({ error: 'Error al procesar la contraseña' });
          return;
        }

        // Actualizar contraseña y limpiar token
        db.run(
          'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
          [hashedPassword, user.id],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({
              message: 'Contraseña actualizada exitosamente',
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              }
            });
          }
        );
      });
    }
  );
});

// Verificar token de recuperación
router.post('/verify-reset-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    res.status(400).json({ error: 'Token es requerido' });
    return;
  }

  db.get(
    'SELECT id, name, email FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
    [token, new Date().toISOString()],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!user) {
        res.status(400).json({ error: 'Token inválido o expirado' });
        return;
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    }
  );
});

module.exports = router; 