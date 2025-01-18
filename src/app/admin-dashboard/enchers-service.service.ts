import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  etat:string;
  admin: { id: number};
  articles: { id: number };
}
interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix:string;
  livrable:boolean;
  statut:string;
  quantiter?:number;
}
interface Part_En{
  id: number;
}
@Injectable({
  providedIn: 'root'
})
export class EnchereService {

  constructor(private http: HttpClient) { }

  getAllArticles(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3002/article/getAll`);
  }
  getAdminById(adminId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3003/admins/${adminId}`);
  }

  // Méthode pour récupérer les détails du partenaire par son ID
  getPartEnById(partEnId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3002/parten/${partEnId}`);
  }
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`http://localhost:3002/article/${id}`);
  }
  getAllPartens(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3002/parten/all`);
  }
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
  getAllAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3003/admins`);
  }

  participateInEnchere(userId: number, enchereId: number): Observable<any> {
    return this.http.post<any>(`http://localhost:3002/enchere/${userId}/participate/${enchereId}`, {});
  }
  addEnchere(enchere: Enchere): Observable<Enchere> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Enchere>('http://localhost:3002/enchere/addenchere', enchere)
    .pipe(
      catchError(this.handleError)
    );
  }

  addPart_En(partEn: Part_En): Observable<Part_En> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Part_En>(`http://localhost:3002/parten/add`, partEn);
  }
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
 
  updateIdEnchers(articleId: number, enchereId: number): Observable<any> {
    return this.http.put(`http://localhost:3002/article/updateIdEnchers/${articleId}/${enchereId}`, null).pipe(
        catchError(this.handleError)
    );
}
updateIdEncherss(articleId: number, enchereId: number): Observable<any> {
  return this.http.put(`http://localhost:3002/article/${articleId}/enchere/${enchereId}`, null)
}
clearEnchereFromOtherArticles(articleId: number, enchereId: number): Observable<any> {
  return this.http.delete<any>(`http://localhost:3002/article/${articleId}/${enchereId}`)
    .pipe(
      catchError(this.handleError)
    );
}

    updateEnchere(id: number, updatedEnchere: Enchere): Observable<Enchere> {
      const url = `http://localhost:3002/enchere/UpdateEnchere/${id}`;
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
      console.log('URL :', url);
      console.log('Payload :', updatedEnchere);
    
      return this.http.put<Enchere>(url, updatedEnchere, { headers }).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 500) {
            //console.error('Erreur interne du serveur lors de la mise à jour de l\'enchère :', error);
          }
          return throwError(() => new Error(' la mise à jour de l\'enchère'));
        })
      );
    }

  deleteEnchere(iden: number): Observable<string> {
    return this.http.delete<string>(`http://localhost:3002/enchere/deleteEnchere/${iden}`).pipe(
      catchError(this.handleError)
    );
  }
  getAllEncheres(): Observable<Enchere[]> {
    return this.http.get<Enchere[]>('http://localhost:3002/enchere/getallEncheress');
  }

  getEnchereById(id: number): Observable<Enchere> {
    return this.http.get<Enchere>(`http://localhost:3002/enchere/${id}`);
  }

  getEncheresByArticleId(articleId: number): Observable<Enchere[]> {
    return this.http.get<Enchere[]>(`http://localhost:3002/enchere/article/${articleId}`);
  }

  getEncheresByDateFinAfter(date: Date): Observable<Enchere[]> {
    return this.http.get<Enchere[]>(`http://localhost:3002/enchere/datefin/after/${date}`);
  }

  getEncheresByDateDebutBefore(date: Date): Observable<Enchere[]> {
    return this.http.get<Enchere[]>(`http://localhost:3002/enchere/datedebut/before/${date}`);
  }

  getEncheresByDateDebutBetween(dateDebut1: Date, dateDebut2: Date): Observable<Enchere[]> {
    return this.http.get<Enchere[]>(`http://localhost:3002/enchere/datedebut/between/${dateDebut1}/${dateDebut2}`);
  }
}
