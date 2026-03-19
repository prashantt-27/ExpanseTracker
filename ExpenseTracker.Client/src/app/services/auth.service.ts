import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../models/auth.models';
import { tap } from 'rxjs/operators';

const TOKEN_KEY = 'expenseTracker.token';
const USER_KEY = 'expenseTracker.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<UserDto | null>(
    localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null
  );

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._token());

  constructor(private http: HttpClient) {}

  register(req: RegisterRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, req).pipe(
      tap((res) => this.setSession(res))
    );
  }

  login(req: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, req).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
  }
}

