# 🚀 Guía de Despliegue - Boa Tracking Web

## 📋 Configuración para Netlify

### 1. Preparación del Proyecto

Tu proyecto ya está configurado con los archivos necesarios para Netlify:

- ✅ `netlify.toml` - Configuración de build y deploy
- ✅ `public/_redirects` - Manejo de rutas de React Router
- ✅ `src/config/api.ts` - Configuración centralizada de la API
- ✅ `src/services/RealDataService.ts` - Servicio actualizado para variables de entorno

### 2. Variables de Entorno

Antes de desplegar, necesitas configurar las variables de entorno en Netlify:

#### En Netlify Dashboard:
1. Ve a tu sitio en Netlify
2. **Site settings** → **Environment variables**
3. Agrega la variable:
   ```
   REACT_APP_API_URL = https://tu-backend-en-render.onrender.com/api
   ```

#### Para desarrollo local:
Crea un archivo `.env.local` en la raíz del proyecto:
```
REACT_APP_API_URL=http://localhost:3000/api
```

### 3. Despliegue en Netlify

#### Opción A: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**
   ```bash
   git add .
   git commit -m "Configuración para Netlify"
   git push origin main
   ```

2. **Conecta con Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Haz clic en **"New site from Git"**
   - Selecciona **GitHub**
   - Busca tu repositorio: `TrackingApp_frontend` (o el nombre que tengas)

3. **Configuración de Build**
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Base directory**: (dejar vacío)

4. **Variables de Entorno**
   - En la sección **Environment variables** agrega:
     ```
     REACT_APP_API_URL = https://tu-backend-en-render.onrender.com/api
     ```

5. **Deploy**
   - Haz clic en **"Deploy site"**

#### Opción B: Drag & Drop

1. **Build local**
   ```bash
   npm run build
   ```

2. **Subir a Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Arrastra la carpeta `build` al área de deploy

### 4. Configuración Post-Deploy

#### Dominio Personalizado (Opcional)
1. En Netlify Dashboard → **Domain settings**
2. **Add custom domain**
3. Sigue las instrucciones para configurar DNS

#### Configuración de HTTPS
- Netlify proporciona HTTPS automáticamente
- No necesitas configuración adicional

### 5. Verificación

Después del deploy, verifica:

1. **Frontend funciona**: Tu app React se carga correctamente
2. **Rutas funcionan**: Navegación entre páginas sin errores 404
3. **API conecta**: Las llamadas al backend funcionan
4. **Responsive**: La app se ve bien en móviles

### 6. Troubleshooting

#### Error: "Page not found" en rutas
- Verifica que `public/_redirects` esté configurado correctamente
- Asegúrate de que `netlify.toml` tenga la configuración de redirects

#### Error: "Cannot connect to backend"
- Verifica que `REACT_APP_API_URL` esté configurada correctamente
- Asegúrate de que tu backend en Render esté funcionando
- Revisa los logs de Netlify para errores de build

#### Error: "Build failed"
- Verifica que todas las dependencias estén en `package.json`
- Revisa que no haya errores de TypeScript
- Ejecuta `npm run build` localmente para detectar errores

### 7. URLs de Referencia

- **Frontend (Netlify)**: `https://tu-app.netlify.app`
- **Backend (Render)**: `https://tu-backend.onrender.com`
- **API Endpoint**: `https://tu-backend.onrender.com/api`

### 8. Comandos Útiles

```bash
# Build local para testing
npm run build

# Servir build local
npx serve -s build

# Verificar configuración de Netlify
netlify status

# Deploy manual (si tienes Netlify CLI)
netlify deploy --prod
```

---

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz cambios en tu código
2. Commit y push a GitHub
3. Netlify detectará automáticamente los cambios
4. Se ejecutará un nuevo deploy

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de build en Netlify
2. Verifica la configuración de variables de entorno
3. Asegúrate de que el backend esté funcionando
4. Revisa la consola del navegador para errores de JavaScript 