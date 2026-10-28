/**
 * @file app.ts
 * @description รูทคอมโพเนนต์หลักของระบบ (Root Application Component)
 * @module App
 * @architecture Angular 22 Standalone, OnPush Change Detection
 * @author example.com Architecture Team
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
