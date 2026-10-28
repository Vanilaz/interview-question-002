/**
 * @file environment.ts
 * @description ศูนย์รวมการตั้งค่าตัวแปรสภาพแวดล้อม (Environment Configuration) สำหรับระบบ Frontend
 * @module Environments
 * @architecture Angular 22 Config-driven Architecture (Zero Hardcoding)
 * @author example.com Architecture Team
 */

export const environment = {
  production: false,
  apiUrl: 'https://localhost:7046/api',
  authChannelName: 'example_auth_sync_channel'
};
