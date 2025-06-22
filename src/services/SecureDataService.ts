import { SecurityConfig } from '../config/security';

class SecureDataService {
  private static instance: SecureDataService;

  private constructor() {}

  public static getInstance(): SecureDataService {
    if (!SecureDataService.instance) {
      SecureDataService.instance = new SecureDataService();
    }
    return SecureDataService.instance;
  }

  public encryptData(data: any): string {
    // Aquí irá la lógica de encriptación cuando tengamos el backend
    return btoa(JSON.stringify(data));
  }

  public decryptData(encryptedData: string): any {
    // Aquí irá la lógica de desencriptación cuando tengamos el backend
    return JSON.parse(atob(encryptedData));
  }

  public logAuditEvent(event: string, user: string, clientIp: string): void {
    // Aquí irá la lógica de logging cuando tengamos el backend
    console.log(`[${new Date().toISOString()}] ${event} - User: ${user} - IP: ${clientIp}`);
  }

  public validateDataIntegrity(data: any): boolean {
    // Aquí irá la lógica de validación cuando tengamos el backend
    return true;
  }

  public sanitizeInput(input: string): string {
    // Implementación básica de sanitización
    return input.replace(/[<>]/g, '');
  }

  public generateSecureToken(): string {
    // Generación de token seguro
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public validatePasswordPolicy(password: string): boolean {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = SecurityConfig.passwordPolicy;
    
    if (password.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    if (requireNumbers && !/\d/.test(password)) return false;
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  }
}

export default SecureDataService; 