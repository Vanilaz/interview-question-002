/**
 * @file auth.interceptor.ts
 * @description HTTP Interceptor สำหรับแนบ withCredentials: true กับทุก Request เพื่อส่ง HttpOnly Cookie
 * @module Core/Interceptors
 * @architecture Angular 22 Functional Interceptor (HttpInterceptorFn)
 * @author example.com Architecture Team
 */

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
