

import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormHeaderComponent } from '../../../../shared/components/form-header/form-header';

@Component({
  selector: 'app-welcome',
  imports: [FormHeaderComponent],
  templateUrl: './welcome.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeComponent {

  private readonly authService = inject(AuthService);


  readonly tokenValidation = resource({
    loader: async () => {
      try {
        return await this.authService.validateTokenAsync();
      } catch {
        // หากการตรวจสอบ Cookie ล้มเหลว ให้สั่งล้างเซสชันและนำกลับหน้า Login
        setTimeout(() => this.authService.logout(), 2500);
        throw new Error('การตรวจสอบ JWT Token ล้มเหลว กรุณาเข้าสู่ระบบใหม่');
      }
    }
  });
}
