@echo off
echo ========================================
echo    🚀 Iniciando Boa Tracking Backend
echo ========================================
echo.
echo 📍 Puerto: 3000
echo 🗄️  Base de datos: SQLite (boa.db)
echo 🌐 URL: http://localhost:3000
echo.
echo 📋 Endpoints disponibles:
echo    • GET  /api/users
echo    • GET  /api/packages
echo    • GET  /api/events
echo    • GET  /api/claims
echo    • GET  /api/alerts
echo.
echo 🔗 Para conectar desde HeidiSQL:
echo    Archivo: %CD%\boa.db
echo.
echo ========================================
echo.

npm run dev 