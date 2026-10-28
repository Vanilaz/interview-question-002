import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RegisterComponent } from './register';
import { AuthService } from '../../../../core/services/auth.service';
import { vi } from 'vitest';

describe('RegisterComponent (Typed Reactive Forms)', () => {
  let component: RegisterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should invalidate form when passwords do not match', () => {
    component.form.setValue({
      username: 'alice',
      password: 'Password123',
      confirmPassword: 'MismatchPassword'
    });

    expect(component.form.hasError('passwordMismatch')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('should validate form when passwords match and requirements are met', () => {
    component.form.setValue({
      username: 'alice',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    expect(component.form.hasError('passwordMismatch')).toBe(false);
    expect(component.form.valid).toBe(true);
  });

  it('should set errorMessage and NOT navigate when registration HTTP fails', async () => {
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    vi.spyOn(authService, 'registerAsync').mockRejectedValue({ status: 0 });

    component.form.setValue({
      username: 'alice',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    await component.onSubmit();

    expect(component.errorMessage()).toContain('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
