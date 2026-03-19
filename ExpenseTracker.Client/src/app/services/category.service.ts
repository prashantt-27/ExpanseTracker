import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CategoryDto, CreateCategoryRequest } from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<CategoryDto[]>(`${environment.apiUrl}/api/categories`);
  }

  create(req: CreateCategoryRequest) {
    return this.http.post<CategoryDto>(`${environment.apiUrl}/api/categories`, req);
  }

  delete(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/api/categories/${id}`);
  }
}

