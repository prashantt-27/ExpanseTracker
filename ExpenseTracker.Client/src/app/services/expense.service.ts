import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CreateExpenseRequest, ExpenseDto, UpdateExpenseRequest } from '../models/expense.models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private http: HttpClient) {}

  getAll(filters?: { from?: string; to?: string; categoryId?: string; search?: string }) {
    let params = new HttpParams();
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<ExpenseDto[]>(`${environment.apiUrl}/api/expenses`, { params });
  }

  getById(id: string) {
    return this.http.get<ExpenseDto>(`${environment.apiUrl}/api/expenses/${id}`);
  }

  create(req: CreateExpenseRequest) {
    return this.http.post<ExpenseDto>(`${environment.apiUrl}/api/expenses`, req);
  }

  update(id: string, req: UpdateExpenseRequest) {
    return this.http.put<ExpenseDto>(`${environment.apiUrl}/api/expenses/${id}`, req);
  }

  delete(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/api/expenses/${id}`);
  }
}
