import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { User } from './user';
import { Router } from '@angular/router';

interface Credentials {
  nom: string;
  password: string;
  type: string;
  email:string;
  photo:string;
  cin: number;
  tel: number;
  prenom: string;
}

interface LoginResponse {
  token: string;
  jwt: string;
  nom: string;
  userId: number;
  email: string;
  password: string;
  cin: number;
  tel: number;
  prenom: string;
  photo:string;
  type:string[]
}

interface RegisterResponse {
  token: string;
  jwt: string;
  nom: string;
  userId: number;
  email: string;
  password: string;
  cin: number;
  tel: number;
  prenom: string;
  photo:string;
  type:string[]
}
const AUTH_API = 'http://localhost:3003';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();

  userData = new BehaviorSubject<User | null>(null);
  userDataObs$ = this.userData.asObservable();
  currentUser: User | null = null;
  nom:string | undefined;
 // Déclarez la propriété isLoggedInSubject avec la bonne visibilité
 private isLoggedInSubject = new BehaviorSubject<boolean>(false);
 authStatus = this.isLoggedInSubject.asObservable();
  constructor(private http: HttpClient ,  public router: Router) { 
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
  getPhotoByName(nom: string): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };  
    return this.http.get<{ photo: string }>(`${AUTH_API}/photo/${nom}`, httpOptions)
      .pipe(
        map(response => response.photo)
      );
  }
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${AUTH_API}/getUserById/${userId}`);
  }
  
  isLoggedIn(): boolean {
      return !!this.token.value;
    }
    login(credentials: Credentials): Observable<LoginResponse> {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };  
      return this.http.post<LoginResponse>(`${AUTH_API}/signin`, credentials, httpOptions)
        .pipe(
         // catchError(this.handleError),
          map((response: LoginResponse) => {
            // Enregistrement des informations d'authentification dans le local storage
            localStorage.setItem('token', response.token);
            localStorage.setItem('email', response.email);
            localStorage.setItem('password', response.password);
            localStorage.setItem('username', response.nom);
            localStorage.setItem('type', JSON.stringify(response.type));
            localStorage.setItem('photo', response.photo);
            // Mettre à jour le sujet isLoggedInSubject
            this.isLoggedInSubject.next(true);
            return response;
          })
        );
    }  
  register(user: any): Observable<RegisterResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(`${AUTH_API}/signup`, user, httpOptions)
    .pipe(
      catchError(this.handleError),
      map((response:any ) => {
       // localStorage.setItem('token', response.token);
        localStorage.setItem('email', response.email);
        localStorage.setItem('password', response.password);
        localStorage.setItem('username', response.username);
        localStorage.setItem('cin', response.cin);
        localStorage.setItem('tel', response.tel);
        localStorage.setItem('prenom', response.prenom);
        localStorage.setItem('type', JSON.stringify(response.type));
        localStorage.setItem('photo', response.photo);
        // Mettre à jour le sujet isLoggedInSubject
     
        this.isLoggedInSubject.next(true);
        return response;
      })
    );
}  

isAdmin(): boolean {
  if (this.userData.value && this.userData.value.type) {
    return this.userData.value.type.includes('admin');
  } else {
    return false; // ou une autre valeur par défaut si nécessaire
  }
  
}

private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    // Erreur côté client
    console.error('Une erreur s\'est produite :', error.error.message);
    // Retourner une erreur observable avec un message d'erreur convivial
    return throwError('Une erreur s\'est produite côté client. Veuillez réessayer.');
  } else {
    // Erreur côté serveur
    console.error(
      `Code d'erreur : ${error.status}, ` +
      `Erreur : ${error.error}`
    );
    // Extraire le message d'erreur de la réponse HTTP si disponible
    const errorMessage = error.error ? error.error.message : 'Une erreur s\'est produite côté serveur.';
    // Retourner une erreur observable avec un message d'erreur convivial
    return throwError(errorMessage);
  }
}


  logout() {
    localStorage.removeItem('token');
    this.currentUser = null;
    this.router.navigate(['log-in']);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }
  clearUser(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('email');
    this.currentUser = null; 
    this.router.navigate(['log-in']);
  }
  getUserPhoto(): string | null {
    const photo = localStorage.getItem('photo');
    console.log("photo récupéré :", photo);
    return photo;
  }
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  clearUserEmail(): void {
    localStorage.removeItem('email');
  }

  getUserEmail(): string | null {
    const email = localStorage.getItem('email');
    //console.log("Email récupéré :", email);
    return email;
  }
  getUserId(): string | null {
    const id = localStorage.getItem('id');
    //console.log("Email récupéré :", id);
    return id;
  }
 
  getUserPassword(): string | null {
    const password = localStorage.getItem('password');
    //console.log("Mot de passe récupéré :", password);
    return password;
  }

  getUserPrenom(): string | null {
    const prenom = localStorage.getItem('prenom');
    //console.log("prenom récupéré :", prenom);
    return prenom;
  }

  getUserName(): string | null {
    const username = localStorage.getItem('username');
    //console.log("username récupéré :", username);
    return username;
  }
  isLoggedInn(): boolean {
    return localStorage.getItem('access_token') !== null;
  }
 
  getUserTel(): number | null {
    const telString = localStorage.getItem('tel');
    // Convertir la chaîne en nombre
    const tel = telString ? parseInt(telString) : null;
   // console.log("Numéro de téléphone récupéré :", tel);
    return tel;
  }
  
  getUserType(): string[] | null {
    const userTypeString = localStorage.getItem('type');
    const userType = userTypeString ? JSON.parse(userTypeString) : null;
   // console.log("Type d'utilisateur récupéré :", userType);
    return userType;
  }
  getUserCin(): number | null {
    const cinString = localStorage.getItem('cin');
    // Convertir la chaîne en nombre
    const cin = cinString ? parseInt(cinString) : null;
   // console.log("Numéro de cin récupéré :", cin);
    return cin;
  }
}
