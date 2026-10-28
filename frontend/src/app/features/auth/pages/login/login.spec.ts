import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login';

describe('LoginComponent (Modern Typed Reactive Forms & No-Constructor)', () => {
  let component: LoginComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should initialize with invalid empty form', () => {
    expect(component.form.valid).toBe(false);
    expect(component.f.username.value).toBe('');
    expect(component.f.password.value).toBe('');
  });

  it('should validate when correct username and password are provided', () => {
    component.form.setValue({
      username: 'demouser',
      password: 'password123'
    });

    expect(component.form.valid).toBe(true);
  });

  it('should invalidate when username is too short', () => {
    component.form.setValue({
      username: 'ab',
      password: 'password123'
    });

    expect(component.form.valid).toBe(false);
    expect(component.f.username.hasError('minlength')).toBe(true);
  });
});
