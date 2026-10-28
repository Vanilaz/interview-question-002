/**
 * @file login.ts
 * @description คอมโพเนนต์หน้าจอเข้าสู่ระบบ (Form IT 02-1)
 * @module Features/Auth/Pages/Login
 * @architecture Angular 22 Standalone, Typed Reactive Forms, Signals & No-Constructor Pattern
 * @security Pure HttpOnly Cookie Authentication (Zero LocalStorage Token Storage)
 * @author example.com Architecture Team
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormHeaderComponent } from '../../../../shared/components/form-header/form-header';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, FormHeaderComponent],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });


  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);


  private consumeSuccessMessage(): string | null {
    if (typeof history !== 'undefined' && history.state?.['registered']) {
      const cleanState = { ...history.state };
      delete cleanState.registered;
      history.replaceState(cleanState, '');
      return 'สมัครสมาชิกสำเร็จ กรุณาลงชื่อเข้าใช้งาน';
    }
    return null;
  }

  readonly successMessage = signal<string | null>(this.consumeSuccessMessage());

  get f() {
    return this.form.controls;
  }


  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();

    try {
      await this.authService.loginAsync({
        username: rawValue.username.trim(),
        password: rawValue.password
      });

      // นำทางไปยัง Form IT 02-3 (Welcome Screen) เมื่อยืนยันตัวตนสำเร็จ
      this.router.navigate(['/welcome']);
    } catch (err: any) {
      if (err.status === 401) {
        this.errorMessage.set('User หรือ Password ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      } else if (err.error?.detail) {
        this.errorMessage.set(err.error.detail);
      } else {
        this.errorMessage.set('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ (กรุณาตรวจสอบว่า Backend เปิดบริการอยู่หรือไม่)');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
