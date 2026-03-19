import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  CategoryBreakdownDto,
  DashboardSummaryDto,
  MonthlyExpensesPointDto,
} from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  summary() {
    return this.http.get<DashboardSummaryDto>(`${environment.apiUrl}/api/dashboard/summary`);
  }

  categoryBreakdown(filters?: { from?: string; to?: string }) {
    let params = new HttpParams();
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    return this.http.get<CategoryBreakdownDto[]>(
      `${environment.apiUrl}/api/dashboard/category-breakdown`,
      {
        params,
      },
    );
  }

  monthlyExpenses(monthsBack = 12) {
    const params = new HttpParams().set('monthsBack', monthsBack);
    return this.http.get<MonthlyExpensesPointDto[]>(
      `${environment.apiUrl}/api/dashboard/monthly-expenses`,
      {
        params,
      },
    );
  }
}
