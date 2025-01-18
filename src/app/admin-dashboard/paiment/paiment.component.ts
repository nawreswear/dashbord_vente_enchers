import { Component, OnInit } from '@angular/core';
import { PaiementService } from '../paiment.service';
import { User } from 'src/app/interfaces/user';
import { Observable } from 'rxjs';

export interface Panier {
  id: number;
  totalP: number;
  quantitecde: number;
  //paiements: Paiement[];
  //partEn: { id: number };
  //articles: Article[];
}

export interface PartEn {
  id: number;
  panier: Panier;
  users: User[];
}

export interface Article {
  id: number;
  titre: string;
  photo: string;
  description: string;
  quantiter: number;
  prix: number;
  livrable: boolean;
  statut: string;
  prixvente: number;
  vendeur: { id: number ,nom:string};
  categorie: Categorie;
}

export interface Categorie {
  id: number;
  titre: string;
  description: string;
  image: string;
}

export interface Paiement {
  id: number;
  montant: number;
  statut: string;
  date: Date;
  panier: { id: number , totalP: number};
}

@Component({
  selector: 'app-paiment',
  templateUrl: './paiment.component.html',
  styleUrls: ['./paiment.component.css']
})
export class PaimentComponent implements OnInit {
  paiements$: Observable<Paiement[]> | undefined;

  constructor(private paimentService: PaiementService) { }

  ngOnInit(): void {
    this.getAllPaiements();
  }

  getAllPaiements(): void {
    this.paiements$ = this.paimentService.getAllPaiements();
  }
}
