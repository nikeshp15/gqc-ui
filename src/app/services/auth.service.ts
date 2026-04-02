import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API = 'http://localhost:8080/auth';

  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  isLoggedIn$ = this.loggedIn$.asObservable();

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(
        `${this.API}/login`,
        {
          username,
          password,
        },
        // { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          console.log('NICK::login:response::', res);
          // localStorage.setItem('token', res.token);
          this.loginSuccess(res.token);
        }),
      );
  }

  loginSuccess(token: string) {
    localStorage.setItem('token', token);
    this.loggedIn$.next(true);
  }

  refreshToken() {
    return this.http.post<{ accessToken: string }>(`${this.API}/refresh`, {});
  }

  logout() {
    console.log('NICK::logout: service');

    return (
      this.http
        .post(
          `${this.API}/logout`,
          {},
          // { withCredentials: true }, // 👈 VERY IMPORTANT
        )
        // .subscribe({
        //   next: () => this.clearSession(),
        //   error: () => this.clearSession(),
        // });
        .pipe(
          tap((res) => {
            console.log('logout success', res);
            this.clearSession();
          }),
        )
    );
  }

  private clearSession() {
    console.log('NICK::logout: clear session');

    localStorage.removeItem('token'); // access token
    this.loggedIn$.next(false);
  }
}
