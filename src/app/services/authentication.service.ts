import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginForm, SignUpForm, User } from '../interfaces/user';
//import { API_URL } from '../constants';
import { BehaviorSubject } from 'rxjs';
//import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();

  userData = new BehaviorSubject<User | null>(null);
  userDataObs$ = this.userData.asObservable();

  constructor(
    private httpClient: HttpClient,
   // private jwtHelper: JwtHelperService,
    private router: Router
  ) {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token.next(storedToken);
      //this.decodeToken();
    }
    this.tokenObs$.subscribe({
      next: (token) => {
        if (!token) router.navigate(['/']);
      },
    });
  }

  isLoggedIn(): boolean {
    return !!this.token.value;
  }
  isAdmin(): boolean {
    if (this.userData.value && this.userData.value.type) {
      return this.userData.value.type.includes('admin');
    } else {
      return false; // ou une autre valeur par défaut si nécessaire
    }
    
  }

  logOut(): void {
    this.token.next(null);
    this.userData.next(null);

    localStorage.removeItem('token');
  }

}
