import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar h-100 p-3">
      <div class="fw-semibold text-uppercase small text-white-50 mb-3">Navigation</div>

      <ul class="nav nav-pills flex-column gap-1">
        <li class="nav-item">
          <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/expenses" routerLinkActive="active">Expenses</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/categories" routerLinkActive="active">Categories</a>
        </li>
      </ul>
    </div>
  `
})
export class SidebarComponent {}

