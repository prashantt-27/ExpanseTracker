import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { CategoryDto } from '../../models/category.models';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 mb-0">Categories</h1>
    </div>

    <div class="row g-3">
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="fw-semibold mb-2">Add Category</div>

            <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

            <form [formGroup]="form" (ngSubmit)="create()">
              <div class="input-group">
                <input class="form-control" placeholder="e.g. Groceries" formControlName="name" />
                <button class="btn btn-dark" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Saving…' : 'Add' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="fw-semibold mb-2">Your Categories</div>

            <div *ngIf="loading()" class="text-secondary">Loading…</div>

            <div *ngIf="!loading() && categories().length === 0" class="text-secondary">
              No categories yet.
            </div>

            <div class="list-group" *ngIf="categories().length > 0">
              <div class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let c of categories()">
                <div class="fw-semibold">{{ c.name }}</div>
                <button class="btn btn-outline-danger btn-sm" (click)="remove(c)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoriesPage implements OnInit {
  readonly categories = signal<CategoryDto[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(80)])
  });

  constructor(private categoriesApi: CategoryService) {}

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.error.set(null);
    this.loading.set(true);
    this.categoriesApi.getAll().subscribe({
      next: (rows) => this.categories.set(rows),
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to load categories.'),
      complete: () => this.loading.set(false)
    });
  }

  create() {
    if (this.form.invalid) return;
    this.error.set(null);
    this.saving.set(true);
    this.categoriesApi.create(this.form.getRawValue()).subscribe({
      next: (created) => {
        this.categories.set([created, ...this.categories()]);
        this.form.reset({ name: '' });
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to create category.'),
      complete: () => this.saving.set(false)
    });
  }

  remove(c: CategoryDto) {
    this.categoriesApi.delete(c.id).subscribe({
      next: () => this.categories.set(this.categories().filter((x) => x.id !== c.id)),
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to delete category.')
    });
  }
}

