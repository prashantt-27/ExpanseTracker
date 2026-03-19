import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom">
      <div class="container-fluid">
        <a class="navbar-brand fw-semibold" routerLink="/dashboard">ExpenseTracker</a>

        <div class="d-flex align-items-center gap-3">
          <div class="text-white-50 small" *ngIf="user()">
            {{ user()!.name }} ({{ user()!.email }})
          </div>
          <button class="btn btn-outline-light btn-sm" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  readonly user = computed(() => this.auth.user());

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

