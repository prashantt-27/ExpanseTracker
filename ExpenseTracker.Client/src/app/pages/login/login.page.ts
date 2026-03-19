import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-5" style="max-width: 520px;">
      <div class="card shadow-sm border-0">
        <div class="card-body p-4">
          <h2 class="h4 mb-1">Welcome back</h2>
          <p class="text-secondary mb-4">Login to continue.</p>

          <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input class="form-control" type="email" formControlName="email" />
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <input class="form-control" type="password" formControlName="password" />
            </div>

            <button class="btn btn-dark w-100" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Logging in…' : 'Login' }}
            </button>
          </form>

          <div class="mt-3 small">
            No account? <a routerLink="/register">Create one</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginPage {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
  });

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    if (this.form.invalid) return;
    this.error.set(null);
    this.loading.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => this.error.set(err?.error?.message ?? 'Login failed.'),
      complete: () => this.loading.set(false)
    });
  }
}

