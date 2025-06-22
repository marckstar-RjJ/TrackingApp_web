export const SecurityConfig = {
  // Políticas de Contraseñas
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxHistory: 5
  },

  // Políticas de Sesión
  sessionPolicy: {
    timeoutMinutes: 30,
    requireReauth: true
  },

  // Políticas de Acceso
  accessControl: {
    maxLoginAttempts: 3,
    lockoutDurationMinutes: 15,
    requireMFA: true
  },

  // Políticas de Datos
  dataProtection: {
    encryptionEnabled: true,
    backupFrequency: 'daily'
  },

  // Políticas de Auditoría
  auditPolicy: {
    logRetentionDays: 90,
    monitoredEvents: [
      'login',
      'logout',
      'password_change',
      'data_access',
      'data_modification'
    ]
  },

  // Políticas de Comunicación
  communicationPolicy: {
    requireSSL: true,
    minTLSVersion: '1.2'
  }
}; 