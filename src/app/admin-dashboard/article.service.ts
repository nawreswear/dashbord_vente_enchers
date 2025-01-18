import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Vendeur } from '../vendeur-dashboard/vendeur';
import { User } from '../_service/user';
interface Article {
  id: number; 
  titre: string;
  description: string;
  photo: string;
  prix:string;
  livrable:boolean;
  statut:string;
  quantiter:number;
  categorie: Categorie;
  enchere_id:string
}
interface Categorie {
  id: number; 
  titre: string;
  description: string;
  image: string;
}
@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private baseUrl = 'http://localhost:3002/article'; 

  constructor(private http: HttpClient) { }
  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`http://localhost:3002/categorie/getallcategories`);
  }
  getVendeurByArticleId(articleId: number): Observable<number> {
    return this.http.get<number>(`http://localhost:3002/article/${articleId}/vendeur`);
  }
  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/getAll`);
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }

  addArticle(data: Article): Observable<Article> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Article>(`${this.baseUrl}/addArticle`, data); 
  }

  
  updateArticle(id: string, data: Article): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/UpdateArticle/${id}`, data);
  }

  updateArticleStatut(id: number, statut: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updateStatut/${id}`, { statut });
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteArticle/${id}`);
  }

  getAvailableArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/available`);
  }
}
