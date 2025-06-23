#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando proceso de build y testing para Netlify...\n');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.');
  process.exit(1);
}

try {
  // 1. Instalar dependencias
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas\n');

  // 2. Verificar que no hay errores de TypeScript
  console.log('🔍 Verificando TypeScript...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript sin errores\n');

  // 3. Ejecutar tests (si existen)
  console.log('🧪 Ejecutando tests...');
  try {
    execSync('npm test -- --watchAll=false', { stdio: 'inherit' });
    console.log('✅ Tests pasaron\n');
  } catch (error) {
    console.log('⚠️  Tests fallaron o no existen, continuando...\n');
  }

  // 4. Build del proyecto
  console.log('🏗️  Construyendo proyecto...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado\n');

  // 5. Verificar que el build se creó correctamente
  const buildPath = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildPath)) {
    throw new Error('El directorio build no se creó');
  }

  // 6. Verificar archivos importantes
  const importantFiles = ['index.html', 'static/js', 'static/css'];
  for (const file of importantFiles) {
    const filePath = path.join(buildPath, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Advertencia: ${file} no encontrado en build`);
    }
  }

  // 7. Verificar configuración de Netlify
  const netlifyConfig = path.join(__dirname, '..', 'netlify.toml');
  const redirectsFile = path.join(__dirname, '..', 'public', '_redirects');
  
  if (!fs.existsSync(netlifyConfig)) {
    console.warn('⚠️  Advertencia: netlify.toml no encontrado');
  } else {
    console.log('✅ netlify.toml encontrado');
  }

  if (!fs.existsSync(redirectsFile)) {
    console.warn('⚠️  Advertencia: public/_redirects no encontrado');
  } else {
    console.log('✅ public/_redirects encontrado');
  }

  console.log('\n🎉 ¡Build completado exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Sube tu código a GitHub');
  console.log('2. Conecta tu repositorio a Netlify');
  console.log('3. Configura la variable de entorno REACT_APP_API_URL');
  console.log('4. ¡Deploy!');

  // 8. Opcional: Servir el build localmente
  console.log('\n🌐 Para probar localmente:');
  console.log('npx serve -s build');

} catch (error) {
  console.error('\n❌ Error durante el proceso:', error.message);
  process.exit(1);
} 