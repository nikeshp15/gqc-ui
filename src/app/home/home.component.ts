import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-home',
  imports: [DashboardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(private auth: AuthService) {
    this.auth.isLoggedIn$.subscribe((status) => {
      // If logged in, call the games API
      if (status) {
        this.loadGames();
      }
    });
  }

  loadGames() {
    console.log('load games');

    // this.gamesService.getGames().subscribe({
    //   next: (data) => this.games.set(data),
    //   error: (err) => console.error('Failed to load games', err)
    // });
  }
}
