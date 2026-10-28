/**
 * @file auth.service.ts
 * @description เซอร์วิสหลักในการจัดการระบบยืนยันตัวตน (Authentication Service)
 * @module Core/Services
 * @architecture Angular 22 Signals, No-Constructor, Pure HttpOnly Cookie Management
 * @security XSS Immunity (No Token Storage in LocalStorage/SessionStorage)
 * @author example.com Architecture Team
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, TokenValidationResult, User } from '../models/auth.models';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);


  private readonly authChannel = this.initBroadcastChannel();


  private readonly _status = signal<AuthStatus>('idle');
  private readonly _username = signal<string | null>(null);

  readonly status = this._status.asReadonly();
  readonly username = this._username.asReadonly();
  readonly isAuthenticated = computed(() => this._status() === 'authenticated');
  readonly isLoading = computed(() => this._status() === 'loading');


  async initializeAuth(): Promise<boolean> {
    this._status.set('loading');

    try {
      const res = await firstValueFrom(
        this.http.get<TokenValidationResult>(`${environment.apiUrl}/auth/validate`, {
          withCredentials: true
        })
      );

      if (res && res.isValid && res.username) {
        this._username.set(res.username);
        this._status.set('authenticated');
        return true;
      }
      this._username.set(null);
      this._status.set('unauthenticated');
      return false;
    } catch {
      this._username.set(null);
      this._status.set('unauthenticated');
      return false;
    }
  }


  async registerAsync(payload: RegisterRequest): Promise<User> {
    return await firstValueFrom(
      this.http.post<User>(`${environment.apiUrl}/auth/register`, payload)
    );
  }

  async loginAsync(payload: LoginRequest): Promise<AuthResponse> {
    this._status.set('loading');

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload, {
          withCredentials: true
        })
      );

      this._username.set(response.username);
      this._status.set('authenticated');

      this.broadcastAuthEvent('LOGIN', response.username);

      return response;
    } catch (err) {
      this._status.set('unauthenticated');
      throw err;
    }
  }

  async validateTokenAsync(): Promise<TokenValidationResult> {
    try {
      const res = await firstValueFrom(
        this.http.get<TokenValidationResult>(`${environment.apiUrl}/auth/validate`, {
          withCredentials: true
        })
      );

      if (res.isValid && res.username) {
        this._username.set(res.username);
        this._status.set('authenticated');
      } else {
        this._status.set('unauthenticated');
      }
      return res;
    } catch (err) {
      this._status.set('unauthenticated');
      throw err;
    }
  }


  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      );
    } catch {
    } finally {
      this.handleLogoutSuccess();
    }
  }

  private handleLogoutSuccess(): void {
    this._username.set(null);
    this._status.set('unauthenticated');

    this.broadcastAuthEvent('LOGOUT');

    this.router.navigate(['/login']);
  }

  private initBroadcastChannel(): BroadcastChannel | null {
    if (typeof BroadcastChannel === 'undefined') return null;

    const channel = new BroadcastChannel(environment.authChannelName);
    channel.onmessage = (event: MessageEvent<{ type: string; username?: string }>) => {
      if (event.data.type === 'LOGOUT') {
        this._username.set(null);
        this._status.set('unauthenticated');
        this.router.navigate(['/login']);
      } else if (event.data.type === 'LOGIN' && event.data.username) {
        this._username.set(event.data.username);
        this._status.set('authenticated');
      }
    };
    return channel;
  }

  private broadcastAuthEvent(type: 'LOGIN' | 'LOGOUT', username?: string): void {
    try {
      this.authChannel?.postMessage({ type, username });
    } catch {}
  }
}
