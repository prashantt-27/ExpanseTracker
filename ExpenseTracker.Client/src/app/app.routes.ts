import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { ShellPage } from './pages/shell/shell.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { ExpenseListPage } from './pages/expenses/expense-list.page';
import { ExpenseFormPage } from './pages/expenses/expense-form.page';
import { CategoriesPage } from './pages/categories/categories.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  {
    path: '',
    component: ShellPage,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPage },
      { path: 'expenses', component: ExpenseListPage },
      { path: 'expenses/new', component: ExpenseFormPage },
      { path: 'expenses/:id/edit', component: ExpenseFormPage },
      { path: 'categories', component: CategoriesPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
