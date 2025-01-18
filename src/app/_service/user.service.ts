import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';



const USER_KEY = 'auth-user';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private router: Router) { }

   // Fonction pour rediriger l'utilisateur vers le tableau de bord approprié
   redirectToDashboardByType(type: string): void {
    if (type === 'user') {
      this.router.navigate(['/user-dashboard']);
    } else if (type === 'vendeur') {
      this.router.navigate(['/vendeur-dashboard']);
    } else if (type === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else {
      // Gérer d'autres types d'utilisateur ou erreur
      console.error('Type d\'utilisateur non pris en charge');
    }
  }
  
}
