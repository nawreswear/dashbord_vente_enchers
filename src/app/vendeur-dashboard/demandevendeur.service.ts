import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../_service/user';

interface demande_Vendeur{
  id: number| undefined;
    datedem: Date;
    etatdem:boolean;
    user: number | undefined;
    //admin: Admin;
}

@Injectable({
  providedIn: 'root'
})
export class demandevendeurService {


  constructor(private http: HttpClient) { }
  

  /*findUserIdByNom(nomuser: string): Observable<number> {
    return this.http.get<number>(`http://localhost:3002/article/api/${nomuser}`).pipe(
      catchError(this.handleError)
    );
  }*/
  findUserIdByNom(nomuser: string): Observable<number> {
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
  
 // Méthode pour récupérer toutes les demandes de vendeurs
 getAllDemandeVendeurs(): Observable<demande_Vendeur[]> {
    return this.http.get<demande_Vendeur[]>('http://localhost:3002/demandesvendeurs/all');
  }

  // Méthode pour récupérer une demande de vendeur par son ID
  getDemandeVendeurById(id: number): Observable<demande_Vendeur> {
    return this.http.get<demande_Vendeur>('http://localhost:3002/demandesvendeurs/${id}');
  }

  // Méthode pour créer une demande de vendeur
  createDemandeVendeur(demandeVendeur: demande_Vendeur, userId: number): Observable<demande_Vendeur> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    // Utilisez l'URL avec le paramètre userId dans la query string
    const url = `http://localhost:3002/demandesvendeurs/create?userId=${userId}`;

    return this.http.post<demande_Vendeur>(url, demandeVendeur, httpOptions)
        .pipe(
            catchError(this.handleError)
        );
}
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
  // Méthode pour mettre à jour une demande de vendeur
  updateDemandeVendeur(id: number, demandeVendeurDetails: demande_Vendeur): Observable<demande_Vendeur> {
    return this.http.put<demande_Vendeur>('http://localhost:3002/demandesvendeurs/${id}', demandeVendeurDetails);
  }

  // Méthode pour supprimer une demande de vendeur
  deleteDemandeVendeur(id: number): Observable<void> {
    return this.http.delete<void>('http://localhost:3002/demandesvendeurs/${id}');
  }
}