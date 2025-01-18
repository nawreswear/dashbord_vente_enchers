import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';// Import your Categorie model

interface Categorie {
  id: number; // Assurez-vous que le type correspond à votre base de données
  titre: string;
  description: string;
  image: string;
}
interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  livrable: boolean;
  statut: string; 
  quantiter: number;
}
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private baseUrl = 'http://localhost:3002/categorie'; 

  constructor(private http: HttpClient) { }
 
  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.baseUrl}/getallcategories`);
  }
  getArticlesForCategory(categoryId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/${categoryId}/articles`);
  }
  getCategoryById(id: string): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.baseUrl}/getcategorieById/${id}`);
  }

  createCategory(data: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.baseUrl}/addCategorie`, data);
  }

  updateCategorie(id: string, data: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.baseUrl}/updateCategorie/${id}`, data);
  }

  deleteCategoryById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteCategorie/${id}`);
  }

  deleteAllCategories(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteAllCategories`); 
  }

}
