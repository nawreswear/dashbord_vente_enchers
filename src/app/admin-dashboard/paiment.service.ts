import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_service/user';
interface Paiement {
  id: number;
  montant: number;
  statut: string;
  date: Date;
  panier: Panier;
}
interface Panier {
  id: number;
  totalP: number;
  date: Date;
  user: User;
}

interface Article {
  id: number; 
  titre: string;
  description: string;
  photo: string;
  prix:string;
  prixvente:string;
  livrable:boolean;
  statut:string;
  quantiter:number;
  categorie: Categorie;
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
export class PaiementService {
  private baseUrl = 'http://localhost:3004/paiements'; // Assurez-vous de remplacer l'URL par celle de votre backend

  constructor(private http: HttpClient) { }

  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  addPaiement(paiement: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.baseUrl}/addPaiement`, paiement);
  }
  getAllPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>('http://localhost:3004/paiements/getAllPaiements');
  }

  getPaiementById(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.baseUrl}/getPaiementById/${id}`);
  }

  updatePaiement(paiement: Paiement, id: number): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.baseUrl}/updatePaiement/${id}`, paiement);
  }

  deletePaiement(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/deletePaiement/${id}`);
  }
}
