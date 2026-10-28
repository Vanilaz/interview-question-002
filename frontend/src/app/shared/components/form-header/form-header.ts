/**
 * @file form-header.ts
 * @description คอมโพเนนต์แถบหัวข้อฟอร์มสีเขียว (#00A859) ด้านบนสุดตามแบบร่างข้อสอบ Wireframe ใน No2.docx
 * @module Shared/Components/FormHeader
 * @architecture Angular 22 Standalone, Signal Inputs (input.required), OnPush Change Detection
 * @author example.com Architecture Team
 */

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-header',
  imports: [],
  template: `
    <header class="w-full bg-[#00a859] py-3 text-center border-b border-black shadow-sm">
      <h1 class="text-base font-semibold tracking-wide text-black sm:text-lg">
        {{ title() }}
      </h1>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormHeaderComponent {
  // Angular Modern Signal-based Input
  readonly title = input.required<string>();
}
