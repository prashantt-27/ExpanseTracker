import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { CategoryService } from '../../services/category.service';
import { ExpenseDto } from '../../models/expense.models';
import { CategoryDto } from '../../models/category.models';

@Component({
  selector: 'app-expense-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 mb-0">Expenses</h1>
      <a class="btn btn-dark" routerLink="/expenses/new">Add Expense</a>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body">
        <form class="row g-2 align-items-end" [formGroup]="filters" (ngSubmit)="reload()">
          <div class="col-md-3">
            <label class="form-label">From</label>
            <input class="form-control" type="date" formControlName="from" />
          </div>
          <div class="col-md-3">
            <label class="form-label">To</label>
            <input class="form-control" type="date" formControlName="to" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Category</label>
            <select class="form-select" formControlName="categoryId">
              <option value="">All</option>
              <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Search</label>
            <input class="form-control" placeholder="title / notes" formControlName="search" />
          </div>
          <div class="col-12 d-flex gap-2">
            <button class="btn btn-outline-dark" type="submit" [disabled]="loading()">Apply</button>
            <button class="btn btn-outline-secondary" type="button" (click)="reset()">Reset</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th class="text-end">Amount</th>
              <th class="text-center">Level</th>
              <th style="width: 160px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading()">
              <td colspan="6" class="text-secondary p-4">Loading…</td>
            </tr>
            <tr *ngIf="!loading() && rows().length === 0">
              <td colspan="6" class="text-secondary p-4">No expenses found.</td>
            </tr>
            <tr *ngFor="let x of rows()">
              <td>{{ x.date }}</td>
              <td class="fw-semibold">{{ x.title }}</td>
              <td>{{ x.categoryName }}</td>
              <td class="text-end">{{ x.amount | number: '1.2-2' }}</td>
              <td class="text-center">
                <span class="badge"
                  [class.bg-success]="x.amount < 8000"
                  [class.bg-warning]="x.amount >= 8000 && x.amount <= 15000"
                  [class.bg-danger]="x.amount > 15000"
                  [class.text-dark]="x.amount >= 8000 && x.amount <= 15000">
                  {{ x.amount < 8000 ? 'Low' : x.amount <= 15000 ? 'Moderate' : 'High' }}
                </span>
              </td>
              <td class="text-end">
                <a
                  class="btn btn-sm btn-outline-dark me-2"
                  [routerLink]="['/expenses', x.id, 'edit']"
                  >Edit</a
                >
                <button class="btn btn-sm btn-outline-danger" (click)="remove(x)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ExpenseListPage implements OnInit {
  readonly rows = signal<ExpenseDto[]>([]);
  readonly categories = signal<CategoryDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private fb = inject(FormBuilder);

  readonly filters = this.fb.nonNullable.group({
    from: this.fb.nonNullable.control(''),
    to: this.fb.nonNullable.control(''),
    categoryId: this.fb.nonNullable.control(''),
    search: this.fb.nonNullable.control(''),
  });

  constructor(
    private expensesApi: ExpenseService,
    private categoriesApi: CategoryService,
  ) {}

  ngOnInit() {
    this.categoriesApi.getAll().subscribe({
      next: (rows) => this.categories.set(rows),
      error: () => this.categories.set([]),
    });
    this.reload();
  }

  reset() {
    this.filters.reset({ from: '', to: '', categoryId: '', search: '' });
    this.reload();
  }

  reload() {
    this.error.set(null);
    this.loading.set(true);
    const f = this.filters.getRawValue();

    this.expensesApi
      .getAll({
        from: f.from || undefined,
        to: f.to || undefined,
        categoryId: f.categoryId || undefined,
        search: f.search || undefined,
      })
      .subscribe({
        next: (rows) => this.rows.set(rows),
        error: (err) => this.error.set(err?.error?.message ?? 'Failed to load expenses.'),
        complete: () => this.loading.set(false),
      });
  }

  remove(x: ExpenseDto) {
    this.expensesApi.delete(x.id).subscribe({
      next: () => this.rows.set(this.rows().filter((r) => r.id !== x.id)),
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to delete expense.'),
    });
  }
}
