import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        console.log('login success--- component');
        this.router.navigate(['/home']);
      },
      error: () => {
        alert('Invalid credentials');
      },
    });
  }
}
