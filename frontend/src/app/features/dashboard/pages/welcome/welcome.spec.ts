import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { WelcomeComponent } from './welcome';

describe('WelcomeComponent (Modern Resource API & No-Constructor)', () => {
  let component: WelcomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
  });

  it('should create component instance and have tokenValidation resource', () => {
    expect(component).toBeTruthy();
    expect(component.tokenValidation).toBeDefined();
    expect(typeof component.tokenValidation.isLoading).toBe('function');
  });
});
