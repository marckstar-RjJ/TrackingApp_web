# 🎯 Guía de Configuración para Presentación

## 📱 **Estrategia: Backend Local + Frontend Netlify**

### **Configuración:**
- ✅ **Backend**: Tu PC (puerto 3000) - Accesible desde la red WiFi
- ✅ **Frontend**: Netlify - Accesible desde internet
- ✅ **Red**: Compartir internet de tu celular a PC
- ✅ **Acceso**: Cualquier dispositivo en la misma red WiFi

---

## 🚀 **Pasos para la Presentación**

### **1. Preparar el Backend**

```bash
# En la carpeta backend
cd backend

# Obtener tu IP local
npm run get-ip

# Iniciar servidor para presentación
npm run presentation
```

### **2. Configurar Red WiFi**

1. **En tu celular:**
   - Ve a **Configuración** → **Conexiones** → **Punto de acceso móvil**
   - Activa **"Compartir internet"**
   - Anota la **contraseña WiFi**

2. **En tu PC:**
   - Conéctate al WiFi de tu celular
   - Usa la contraseña que configuraste

### **3. Obtener IP Local**

Ejecuta el comando para ver tu IP:
```bash
npm run get-ip
```

**Ejemplo de salida:**
```
🌐 Configuración para Presentación:
=====================================
📱 IP Local de tu PC: 192.168.1.100
🔗 URL del Backend: http://192.168.1.100:3000
🔗 URL de la API: http://192.168.1.100:3000/api
```

### **4. Configurar Frontend (Netlify)**

En Netlify, configura la variable de entorno:
```
REACT_APP_API_URL = http://192.168.1.100:3000/api
```

**Reemplaza `192.168.1.100` con tu IP real.**

### **5. Probar la Configuración**

1. **Desde tu PC:**
   - Backend: `http://localhost:3000`
   - Frontend: `https://tu-app.netlify.app`

2. **Desde otro dispositivo (mismo WiFi):**
   - Backend: `http://192.168.1.100:3000`
   - Frontend: `https://tu-app.netlify.app`

---

## 🔧 **Comandos Útiles**

### **Backend:**
```bash
# Obtener IP local
npm run get-ip

# Iniciar para presentación
npm run presentation

# Desarrollo normal
npm run dev

# Producción
npm start
```

### **Frontend (Netlify):**
```bash
# Build local para testing
npm run build:test

# Servir build local
npm run serve:build
```

---

## 📋 **Checklist para Presentación**

### **Antes de la Presentación:**
- [ ] Backend configurado para escuchar en todas las interfaces
- [ ] IP local obtenida y anotada
- [ ] Frontend configurado con la IP correcta en Netlify
- [ ] Internet compartido desde celular a PC
- [ ] Backend iniciado y funcionando
- [ ] Frontend desplegado en Netlify

### **Durante la Presentación:**
- [ ] Conectar otros dispositivos al WiFi compartido
- [ ] Probar acceso al frontend desde diferentes dispositivos
- [ ] Demostrar funcionalidades en tiempo real
- [ ] Mostrar que el backend está funcionando localmente

### **URLs de Acceso:**
- **Frontend (Netlify)**: `https://tu-app.netlify.app`
- **Backend (Local)**: `http://[TU_IP]:3000`
- **API**: `http://[TU_IP]:3000/api`

---

## 🛠️ **Troubleshooting**

### **Problema: No se puede acceder al backend**
- Verifica que el firewall de Windows permita conexiones al puerto 3000
- Asegúrate de que el servidor esté escuchando en `0.0.0.0:3000`
- Confirma que estés en la misma red WiFi

### **Problema: Frontend no conecta al backend**
- Verifica que `REACT_APP_API_URL` esté configurada correctamente en Netlify
- Asegúrate de que la IP sea la correcta
- Revisa que el backend esté funcionando

### **Problema: Conexión WiFi lenta**
- Acerca los dispositivos al punto de acceso
- Reduce el número de dispositivos conectados
- Verifica la señal del celular

---

## 🎉 **Ventajas de esta Configuración**

1. **✅ Sin dependencias externas**: Backend funciona sin internet
2. **✅ Control total**: Puedes modificar datos en tiempo real
3. **✅ Estable**: No depende de servicios externos
4. **✅ Flexible**: Funciona en cualquier red WiFi
5. **✅ Profesional**: Frontend en Netlify se ve profesional

---

## 📞 **Soporte Rápido**

Si algo no funciona:
1. Verifica que el backend esté corriendo: `http://localhost:3000`
2. Obtén tu IP: `npm run get-ip`
3. Confirma la variable de entorno en Netlify
4. Prueba desde diferentes dispositivos

¡Tu presentación estará lista! 🚀 