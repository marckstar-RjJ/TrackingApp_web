const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:3000/api/users';

async function testPasswordReset() {
  console.log('🧪 Probando funcionalidad de recuperación de contraseña...\n');

  try {
    // 1. Solicitar recuperación de contraseña
    console.log('1. Solicitando recuperación de contraseña...');
    const forgotResponse = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marckstar1@gmail.com' })
    });
    
    const forgotData = await forgotResponse.json();
    console.log('Respuesta:', forgotData);
    
    if (!forgotResponse.ok) {
      console.log('❌ Error al solicitar recuperación');
      return;
    }

    const resetToken = forgotData.resetToken;
    console.log(`✅ Token generado: ${resetToken}\n`);

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

    // 4. Probar login con nueva contraseña
    console.log('4. Probando login con nueva contraseña...');
    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'marckstar1@gmail.com', 
        password: 'NuevaContraseña123!' 
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Respuesta:', loginData);
    
    if (!loginResponse.ok) {
      console.log('❌ Error al hacer login con nueva contraseña');
      return;
    }
    console.log('✅ Login exitoso con nueva contraseña\n');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

testPasswordReset(); 