const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:3000/api/users';

async function testPasswordResetFlow() {
  console.log('🧪 Probando flujo de recuperación de contraseña con EmailJS...\n');

  try {
    // 1. Solicitar recuperación de contraseña
    console.log('1. Solicitando token de recuperación...');
    const forgotResponse = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marckstar1@gmail.com' })
    });
    
    const forgotData = await forgotResponse.json();
    console.log('Respuesta del backend:', forgotData);
    
    if (!forgotResponse.ok || !forgotData.success) {
      console.log('❌ Error al solicitar token');
      return;
    }

    const resetToken = forgotData.resetToken;
    console.log(`✅ Token generado: ${resetToken}\n`);
    console.log('📧 El frontend ahora enviará el email usando EmailJS\n');

    // 2. Verificar token
    console.log('2. Verificando token...');
    const verifyResponse = await fetch(`${API_URL}/verify-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Respuesta:', verifyData);
    
    if (!verifyResponse.ok) {
      console.log('❌ Error al verificar token');
      return;
    }
    console.log('✅ Token válido\n');

    // 3. Resetear contraseña
    console.log('3. Reseteando contraseña...');
    const resetResponse = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token: resetToken, 
        newPassword: 'NuevaContraseña123!' 
      })
    });
    
    const resetData = await resetResponse.json();
    console.log('Respuesta:', resetData);
    
    if (!resetResponse.ok) {
      console.log('❌ Error al resetear contraseña');
      return;
    }
    console.log('✅ Contraseña reseteada exitosamente\n');

    console.log('🎉 ¡Flujo de backend funcionando correctamente!');
    console.log('📧 Ahora el frontend enviará el email usando EmailJS');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

testPasswordResetFlow(); 