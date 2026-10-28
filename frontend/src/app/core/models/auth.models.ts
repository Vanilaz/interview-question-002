/**
 * @file auth.models.ts
 * @description นิยาม Data Transfer Objects (DTOs) และ Interfaces ทั้งหมดสำหรับระบบยืนยันตัวตน
 * @module Core/Models
 * @architecture 100% Strict TypeScript Types (Zero `any`)
 * @author example.com Architecture Team
 */

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  username: string;
  expiresAtUtc: string;
}

export interface User {
  id: string;
  username: string;
  createdAtUtc: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  username: string;
  validatedAtUtc: string;
}
