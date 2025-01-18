import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../_service/user';

interface demande_Vendeur{
    id:string;
    datedem: Date;
    etatdem:boolean;
    userId: number;
    admin:{ id: number | undefined};
}
interface Admin{
  id: number;
  type: string;
  demandes: demande_Vendeur[];
}
@Injectable({
  providedIn: 'root'
})
export class DemandevendeurService {

  constructor(private http: HttpClient) { }

public getUserById(userId: string): Observable<any> {
  const getUrl = `http://localhost:3003/getUserById/${userId}`;
  return this.http.get<any>(getUrl); 
}
updateUserType(userId: number): Observable<any> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  return this.http.put(`http://localhost:3003/users/updateType/${userId}`, null,httpOptions);
}

 // Méthode pour récupérer toutes les demandes de vendeurs
 getAllDemandeVendeurs(): Observable<demande_Vendeur[]> {
  return this.http.get<demande_Vendeur[]>('http://localhost:3002/demandesvendeurs/all')
      .pipe(
          catchError(error => {
              console.error('An error occurred:', error);
              return throwError('Something bad happened; please try again later.');
          })
      );
}

 
  getUserIdByName(nomuser: string): Observable<number> {
    return this.http.get<number>(`http://localhost:3003/api/${nomuser}`).pipe(
      catchError(error => {
        let errorMessage = 'Une erreur s\'est produite lors de la recherche de l\'utilisateur.';
        if (error.status === 404) {
          errorMessage = `Utilisateur non trouvé avec le nom : ${nomuser}`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }

  getDemandeVendeurById(id: number): Observable<demande_Vendeur> {
    return this.http.get<demande_Vendeur>(`http://localhost:3002/demandesvendeurs/getDemandeVendeurById/${id}`);
  }
  
  // Méthode pour créer une demande de vendeur
  createDemandeVendeur(demandeVendeur: demande_Vendeur): Observable<demande_Vendeur> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<demande_Vendeur>('http://localhost:3002/demandesvendeurs/create', demandeVendeur);
  }

  // Méthode pour mettre à jour une demande de vendeur
  updateDemandeVendeur(id: number, demandeVendeurDetails: demande_Vendeur): Observable<demande_Vendeur> {
    return this.http.put<demande_Vendeur>(`http://localhost:3002/demandesvendeurs/${id}`, demandeVendeurDetails);
  }

  // Méthode pour supprimer une demande de vendeur
  deleteDemandeVendeur(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3002/demandesvendeurs/${id}`);
  }
}