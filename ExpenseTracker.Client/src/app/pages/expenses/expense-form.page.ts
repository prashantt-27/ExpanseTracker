import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ExpenseService } from '../../services/expense.service';
import { CategoryDto } from '../../models/category.models';

@Component({
  selector: 'app-expense-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 mb-0">{{ isEdit() ? 'Edit Expense' : 'Add Expense' }}</h1>
      <a class="btn btn-outline-secondary" routerLink="/expenses">Back</a>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <form class="row g-3" [formGroup]="form" (ngSubmit)="save()">
          <div class="col-md-6">
            <label class="form-label">Title</label>
            <input class="form-control" formControlName="title" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Amount</label>
            <input class="form-control" type="number" step="0.01" formControlName="amount" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Date</label>
            <input class="form-control" type="date" formControlName="date" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Category</label>
            <select class="form-select" formControlName="categoryId">
              <option value="" disabled>Select a category</option>
              <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="3" formControlName="notes"></textarea>
          </div>
          <div class="col-12">
            <button class="btn btn-dark" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ExpenseFormPage implements OnInit {
  readonly categories = signal<CategoryDto[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly isEdit = signal(false);

  private expenseId: string | null = null;

  private fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(160)]),
    amount: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0.01)]),
    date: this.fb.nonNullable.control('', [Validators.required]),
    categoryId: this.fb.nonNullable.control('', [Validators.required]),
    notes: this.fb.nonNullable.control('')
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesApi: CategoryService,
    private expensesApi: ExpenseService
  ) {}

  ngOnInit() {
    this.categoriesApi.getAll().subscribe({
      next: (rows) => this.categories.set(rows),
      error: () => this.categories.set([])
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.expenseId = id;
      this.expensesApi.getById(id).subscribe({
        next: (x) =>
          this.form.patchValue({
            title: x.title,
            amount: x.amount,
            date: x.date,
            categoryId: x.categoryId,
            notes: x.notes ?? ''
          }),
        error: (err) => this.error.set(err?.error?.message ?? 'Failed to load expense.')
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.error.set(null);
    this.saving.set(true);

    const payload = this.form.getRawValue();

    const req$ = this.expenseId
      ? this.expensesApi.update(this.expenseId, payload)
      : this.expensesApi.create(payload);

    req$.subscribe({
      next: () => this.router.navigateByUrl('/expenses'),
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to save expense.'),
      complete: () => this.saving.set(false)
    });
  }
}

