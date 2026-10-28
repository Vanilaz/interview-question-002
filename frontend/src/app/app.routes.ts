/**
 * @file app.routes.ts
 * @description แผนผังเส้นทาง (Routes) ตามมาตรฐาน Angular Style Guide
 * @module AppRoutes
 * @architecture Lazy Loading ผ่าน loadComponent: () => import(...) เพื่อทำ Code Splitting
 * @author example.com Architecture Team
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.LoginComponent),
    title: 'Form IT 02-1 | เข้าสู่ระบบ'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.RegisterComponent),
    title: 'Form IT 02-2 | สมัครสมาชิก'
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/dashboard/pages/welcome/welcome').then((m) => m.WelcomeComponent),
    canActivate: [authGuard],
    title: 'Form IT 02-3 | ยินดีต้อนรับ'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
