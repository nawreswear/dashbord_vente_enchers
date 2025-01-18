import { Injectable } from '@angular/core';
import { User } from './_service/user';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
export interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  parten: Part_En[];
  admin: { id: number };
  articles: { id: number }[];
  etat:string;
}
export interface Part_En {
  id: number;
  encheres: Enchere;
  user: User;
  prixproposer: number;
  etat: string;
}
@Injectable({
  providedIn: 'root'
})
export class PartEnService {
  private baseUrl = 'http://localhost:3002/parten';
  
    constructor(private http: HttpClient) { }
  
    addPrixVenteForArticle(partenId: number, Prixproposer: number, enchereId: number): Observable<any> {
      return this.http.post(`${this.baseUrl}/addPrixVenteProposerPar/${partenId}/${Prixproposer}/${enchereId}`,null)
        .pipe(
          tap(response => {
            console.log('Response:', response);
          }),
          catchError(this.handleError)
        );
    }
  
    private handleError(error: HttpErrorResponse) {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur : ${error.error.message}`;
      } else {
        // Erreur côté serveur
        errorMessage = `Code d'erreur : ${error.status}\nMessage : ${error.message}`;
      }
      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    }
  
    getTopPrixProposerParten(enchereId: number): Observable<Part_En> {
      return this.http.get<Part_En>(`${this.baseUrl}/getTopPrixProposerParten/${enchereId}`);
    }
    getAllPart_En(): Observable<Part_En[]> {
      return this.http.get<Part_En[]>(`${this.baseUrl}/all`);
    }
  
    getPart_EnById(id: number): Observable<Part_En> {
      return this.http.get<Part_En>(`${this.baseUrl}/${id}`);
    }
  
    addPart_En(partEn: Part_En): Observable<Part_En> {
      return this.http.post<Part_En>(`${this.baseUrl}/add`, partEn);
    }
  
    updatePart_En(partEn: Part_En): Observable<Part_En> {
      return this.http.put<Part_En>(`${this.baseUrl}/update`, partEn);
    }
  
    deletePart_En(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' });
    }
    getPartenIdByEnchere(enchereId: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/getPartenIdByEnchere/${enchereId}`);
    }
    getPartenIdByUserId(userId: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/${userId}/parten-id`);
    }
   getUserDetails(userId: number): Observable<User> {
      return this.http.get<User>(`${this.baseUrl}/userDetails/${userId}`)
        .pipe(
          catchError(this.handleError)
        );
    }
  
    getUserIdForTopProposedPrice(enchereId: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/topProposedPrice/${enchereId}/userDetails`)
        .pipe(
          catchError(this.handleError)
        );
    }
    checkParticipation(userId: number, enchereId: number): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}/${enchereId}/participation/${userId}`); // Remplacez par l'URL de votre API
    }
    getPartenIdByUserIdd(userId: number,enchereId:number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/${userId}/${enchereId}`);
    }
    getUsersByPartenId(partenId: number): Observable<User[]> {
      return this.http.get<User[]>(`${this.baseUrl}/getUserIdByIdParten/${partenId}`)
        .pipe(
          catchError((error: any) => {
            console.error('Erreur lors de la récupération des utilisateurs associés au partenaire:', error);
            return throwError(error); // Gérer l'erreur
          })
        );
    }
  }