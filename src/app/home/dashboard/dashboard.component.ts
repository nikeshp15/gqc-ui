import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);

  isLoggedIn = signal(false);

  constructor(private auth: AuthService) {
    this.auth.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn.set(status);
    });
  }

  ngOnInit(): void {}

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
        this.router.navigate(['/home']); // Navigate to home on success
      },
      error: (err) => {
        console.error('Logout failed, but clearing local state anyway', err);
        this.router.navigate(['/home']);
      },
    });
  }
}
