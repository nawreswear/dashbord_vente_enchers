import { Injectable } from '@angular/core';
interface User {
  id:string;
  username: string;
  email: string;
  password: string;
  prenom: string,
  tel: number,
  type: string[]; 
  codePostal: number;  
  pays: string;  
  ville: string;  
  cin: number;  
  longitude: number;  
  latitude: number;
  photo: string;
}
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  currentUser: User | null = null;
  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  public saveUser(user:User): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): User | null {
    const userJson = sessionStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

 
  getUserEmail(): string | null {
    const email = localStorage.getItem('email');
    console.log("Email récupéré :", email);
    return email;
  }
  getUserId(): string | null {
    const id = localStorage.getItem('id');
    console.log("Email récupéré :", id);
    return id;
  }
  getUserPassword(): string | null {
    const password = localStorage.getItem('password');
    console.log("Mot de passe récupéré :", password);
    return password;
  }

  getUserPrenom(): string | null {
    const prenom = localStorage.getItem('prenom');
    console.log("Mot de passe récupéré :", prenom);
    return prenom;
  }
 
  isLoggedInn(): boolean {
    return localStorage.getItem('access_token') !== null;
  }

}
