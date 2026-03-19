import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar.component';
import { SidebarComponent } from '../../components/sidebar.component';

@Component({
  selector: 'app-shell-page',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-shell d-flex flex-column">
      <app-navbar />

      <div class="flex-grow-1 d-flex">
        <app-sidebar />
        <main class="flex-grow-1 p-4">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellPage {}

