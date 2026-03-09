import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  user_id: string;
  name: string;
  email: string;
  picture?: string;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  checkAuthStatus(): void {
    // Skip if processing OAuth callback
    if (window.location.hash?.includes('session_id=')) {
      this.isLoadingSubject.next(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoadingSubject.next(false);
      return;
    }

    this.http.get<User>(`${this.apiUrl}/auth/me`, { 
      headers: this.getHeaders(),
      withCredentials: true 
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.isLoadingSubject.next(false);
      }),
      catchError(() => {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        this.isLoadingSubject.next(false);
        return of(null);
      })
    ).subscribe();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
      }),
      catchError(() => {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email }, {
      headers: this.getHeaders()
    });
  }

  resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { 
      token, 
      password, 
      confirmPassword 
    }, {
      headers: this.getHeaders()
    });
  }

  googleLogin(): void {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }

  processGoogleSession(sessionId: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/google/session`, { session_id: sessionId }, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
