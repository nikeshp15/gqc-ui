import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// 🔒 shared state (outside function)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');

  let authReq = req.clone({
    withCredentials: true, // 👈 needed for refresh cookie
  });

  if (token && !req.url.includes('/auth')) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthRequest) {
        // 🔁 If already refreshing → wait
        if (isRefreshing) {
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((newToken) => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
                withCredentials: true,
              });
              return next(retryReq);
            }),
          );
        }

        // 🔑 First request triggers refresh
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            const newToken = res.accessToken;

            // store token
            localStorage.setItem('token', newToken);

            isRefreshing = false;
            refreshTokenSubject.next(newToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
              withCredentials: true,
            });

            return next(retryReq);
          }),
          catchError((err) => {
            isRefreshing = false;

            localStorage.removeItem('token');
            router.navigate(['/login']);

            return throwError(() => err);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
