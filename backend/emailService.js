const { Resend } = require('resend');

// Usamos la API Key que proporcionaste
const resend = new Resend('re_KhGQdiUF_5E9qaN99WsUhSrVp1bDSZcyM');

// Función para enviar email de recuperación de contraseña con Resend
const sendPasswordResetEmail = async (userEmail, resetToken, userName) => {
  try {
    const baseUrl = 'http://localhost:3000'; // Cambiar por tu URL en producción
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      // El plan gratuito de Resend solo permite enviar desde 'onboarding@resend.dev'
      from: 'BOA Tracking <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Recuperación de Contraseña - BOA Tracking',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1976D2; text-align: center;">Recuperación de Contraseña</h2>
          <p>Hola ${userName},</p>
          <p>Has solicitado restablecer tu contraseña para tu cuenta en BOA Tracking. Por favor, haz clic en el siguiente botón para continuar:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1976D2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si no puedes hacer clic en el botón, copia y pega la siguiente URL en tu navegador:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">Gracias,<br>El equipo de BOA Tracking</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Error enviando email con Resend:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email de recuperación enviado con Resend:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Excepción al enviar email con Resend:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPasswordResetEmail }; 