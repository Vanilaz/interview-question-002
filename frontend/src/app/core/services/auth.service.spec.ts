import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Component({ template: '' })
class DummyLoginComponent {}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: DummyLoginComponent }
        ])
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created and default to not authenticated', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.username()).toBeNull();
  });

  it('should login, set user and update in-memory signals', async () => {
    const loginPromise = service.loginAsync({ username: 'testuser', password: 'password123' });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush({
      token: 'jwt-mock-token',
      tokenType: 'Bearer',
      username: 'testuser',
      expiresAtUtc: new Date(Date.now() + 3600000).toISOString()
    });

    const res = await loginPromise;
    expect(res.username).toBe('testuser');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.username()).toBe('testuser');
  });

  it('should clear in-memory state on logout', async () => {
    const logoutPromise = service.logout();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});

    await logoutPromise;
    expect(service.username()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
