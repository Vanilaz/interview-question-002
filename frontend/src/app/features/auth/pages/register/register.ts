/**
 * @file register.ts
 * @description คอมโพเนนต์หน้าจอสมัครสมาชิก (Form IT 02-2)
 * @module Features/Auth/Pages/Register
 * @architecture Angular 22 Standalone, Typed Reactive Forms, Custom Cross-Field Validator & Signals
 * @security BCrypt Password Masking (*) & Validation
 * @author example.com Architecture Team
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormHeaderComponent } from '../../../../shared/components/form-header/form-header';


export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, FormHeaderComponent],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {



  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  readonly form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: [passwordMatchValidator] }
  );


  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
      await this.authService.registerAsync({
        username: rawValue.username.trim(),
        password: rawValue.password,
        confirmPassword: rawValue.confirmPassword
      });

      this.router.navigate(['/login'], {
        state: { registered: true }
      });
    } catch (err: any) {
      if (err.status === 409) {
        this.errorMessage.set('User นี้มีอยู่ในระบบแล้ว กรุณาใช้ User อื่น');
      } else if (err.error?.detail) {
        this.errorMessage.set(err.error.detail);
      } else if (err.error?.errors) {
        const firstErrKey = Object.keys(err.error.errors)[0];
        this.errorMessage.set(err.error.errors[firstErrKey][0]);
      } else {
        this.errorMessage.set('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (กรุณาตรวจสอบว่า Backend เปิดบริการอยู่หรือไม่)');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
