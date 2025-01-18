import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

 interface Vendeur {
  id:string;
  nom: string ;
  email: string ;
  password: string ;
  prenom: string ;
  tel: string ;
  type: string ; 
  codePostal: number ; 
  pays: string ; 
  ville: string ; 
  cin: number ; 
  longitude: number ; 
  latitude: number ;
  photo: String
}

interface Article {
  id: number; // Assurez-vous que le type correspond à votre base de données
  titre: string;
  description: string;
  photo: string;
  prix:string;
  Livrable:boolean;
  statut:string;
  quantite:number;
}

@Injectable({
  providedIn: 'root'
})
export class VendeurService {

  private apiUrl = 'http://localhost:3002/vendeur';

  constructor(private http: HttpClient) { }

 getAllVendeurs(): Observable<Vendeur[]> { 
    return this.http.get<Vendeur[]>(`${this.apiUrl}/vendeurs`);
  }

  addVendeur(vendeur: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<any>(`${this.apiUrl}/signup`, vendeur,httpOptions)
  }
 
  public updateVendeur(vendeurId: string, userData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const updateUrl = `${this.apiUrl}/updateVendeur/${vendeurId}`;
    return this.http.put(updateUrl, userData,httpOptions);
  }

  public deleteVendeur(vendeurId: string): Observable<any> {
    const deleteUrl = `${this.apiUrl}/deleteVendeur/${vendeurId}`;
    return this.http.delete(deleteUrl);
  }

  public getVendeurById(vendeurId: string): Observable<any> {
    const getUrl = `${this.apiUrl}/getVendeurById/${vendeurId}`;
    return this.http.get<any>(getUrl); 
  }

  sendVendeurRequestToAdmin(vendeur: Vendeur): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const adminUrl = `${this.apiUrl}/admin/vendeur-request`; // Assuming this is your admin endpoint
    return this.http.post<any>(adminUrl, vendeur, httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error sending vendeur request to admin:', error);
          return throwError(error);
        })
      );
  }


  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles`);
  }

  ajouterArticle(vendeurId: number, article: Article): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Article>(`${this.apiUrl}/${vendeurId}/ajoutarticles`, article, httpOptions)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de l\'ajout de l\'article:', error);
          return throwError(error);
        })
      );
  }
  

  mettreAJourArticle(article: Article): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.put<any>(`${this.apiUrl}/updatearticles`, article, httpOptions)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la mise à jour de l\'article:', error);
          return throwError(error);
        })
      );
  }

  supprimerArticle(articleId: number): Observable<any> {
    const deleteUrl = `${this.apiUrl}/deletearticles/${articleId}`;
    return this.http.delete<any>(deleteUrl)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression de l\'article:', error);
          return throwError(error);
        })
      );
  }

  getArticlesByNomVendeur(nomVendeur: string): Observable<Article[]> {
    const getUrl = `${this.apiUrl}/${nomVendeur}/articles`;
    return this.http.get<Article[]>(getUrl)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des articles par le nom du vendeur:', error);
          return throwError(error);
        })
      );
  }
}