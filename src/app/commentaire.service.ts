import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './_service/user';

export  interface Commentaire {
  id: number;
  object: string;
  message: string;
  date: Date;
  user: {id:number,nom:string,photo:string};
  article: {id:number};
}
@Injectable({
  providedIn: 'root'
})
export class CommentaireService {
   httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  private baseUrl = 'http://localhost:3005/commentaire'; // URL de base de l'API

  constructor(private http: HttpClient) { }

  getArticleIdByCommentaireId(commentaireId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/commentaire/${commentaireId}/articleid`);
  }
  supprimerCommentaire(commentaireId: number): Observable<void> {
    const url = `${this.baseUrl}/delete/${commentaireId}`;
    return this.http.delete<void>(url);
  }
  // Méthode pour ajouter un commentaire pour un article donné
  ajouterCommentairePourArticle(idArticle: number, commentaire: Commentaire): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.baseUrl}/article/${idArticle}`, commentaire);
  }
  // Méthode pour récupérer tous les commentaires
  getAllCommantaires(): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(this.baseUrl);
  }
  getCommentairesParIdArticle(idArticle: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.baseUrl}/article/${idArticle}/commentaires`, this.httpOptions);
}

  /*getCommentairesParIdArticle(idArticle: number, startIndex: number): Observable<any> {
    const url = `${this.baseUrl}/article/${idArticle}?startIndex=${startIndex}`;
    return this.http.get<any>(url);
  }*/
  // Méthode pour récupérer un commentaire par son ID
  getCommantaireById(id: number): Observable<Commentaire> {
    return this.http.get<Commentaire>(`${this.baseUrl}/${id}`,this.httpOptions);
  }

  // Méthode pour supprimer un commentaire pour un article donné
  supprimerCommentairePourArticle(idArticle: number, idCommentaire: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/article/${idArticle}/commentaire/${idCommentaire}`);
  }

  // Méthode pour mettre à jour un commentaire pour un article donné
  mettreAJourCommentairePourArticle(idArticle: number, idCommentaire: number, commentaire: Commentaire): Observable<Commentaire> {
    return this.http.put<Commentaire>(`${this.baseUrl}/article/${idArticle}/commentaire/${idCommentaire}`, commentaire,this.httpOptions);
  }
  

  // Méthode pour créer un commentaire
  createCommantaire(commentaire: Commentaire): Observable<Commentaire> {
    return this.http.post<Commentaire>(this.baseUrl, commentaire,this.httpOptions);
  }

  // Méthode pour supprimer un commentaire par son ID
  deleteCommantaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Autres méthodes pour récupérer les commentaires par utilisateur, vendeur, mots-clés, etc. peuvent être ajoutées ici
}
