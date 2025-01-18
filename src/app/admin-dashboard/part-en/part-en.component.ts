import { Component, OnInit } from '@angular/core';
import { PartEnService, Part_En } from '../../part-en.service';
import { EnchersServiceService } from 'src/app/enchers-service.service';
//import { Article } from 'src/app/shopping-cart/cards/panier.service';
import { FormGroup } from '@angular/forms';

interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  parten: { id: number }[];
  admin: { id: number };
  articles: { id: number }[];
}
interface Articlee {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  statut: string; 
}

@Component({
  selector: 'app-part-en',
  templateUrl: './part-en.component.html',
  styleUrls: ['./part-en.component.css']
})
export class PartEnComponent implements OnInit {
  public encheres: Enchere[] = [];  // Utiliser le bon type Enchere[]
  public articles: Articlee[] = [];
  public formattedDateDebut!: string;
  public myForm!: FormGroup;
  public formattedDateFin!: string;
  partEns: Part_En[] = [];
  public articlesForEnchereMap: { [enchereId: number]: Articlee[] } = {};
  constructor(private partEnService: PartEnService, private encherService: EnchersServiceService) {
   }
  
  ngOnInit(): void {
    this.getAllPart_En();
    this.encheres.forEach(enchere => {
      // Vérifie si l'ID de l'enchère est défini avant d'appeler la méthode
      if (enchere.id !== undefined) {
        // Appel de la méthode pour récupérer les articles pour chaque enchère
       this.getArticlesForEnchere(enchere.id);
      }
    });
  }
  public getArticlesForEnchere(enchereId: number): Articlee[] | undefined {
    if (this.articlesForEnchereMap[enchereId]) {
      // Si les articles pour cette enchère ont déjà été récupérés, les retourner immédiatement
      return this.articlesForEnchereMap[enchereId];
    } else {
      // Sinon, récupérer les articles depuis le service et les stocker dans le dictionnaire
      this.encherService.getArticlesForEnchere(enchereId).subscribe(
        (articles: Articlee[]) => {
          this.articlesForEnchereMap[enchereId] = articles;
          console.log("Articles pour l'enchère avec ID", enchereId, ":", this.articlesForEnchereMap[enchereId]);
        },
        (error) => {
          console.error('Une erreur s\'est produite lors de la récupération des articles de l\'enchère avec ID', enchereId, ':', error);
        }
      );
      // Retourner undefined pendant que les articles sont récupérés
      return undefined;
    }
  }
  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return ''; // Si le timestamp est indéfini, retourne une chaîne vide

    const date = new Date(timestamp); // Crée une nouvelle instance de Date à partir du timestamp

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} T ${hours}:${minutes}`;
}
  getAllPart_En(): void {
    this.partEnService.getAllPart_En().subscribe(
      (data: Part_En[]) => {
        this.partEns = data;
        console.log(this.partEns); // Afficher les données dans la console à des fins de vérification
      },
      error => {
        console.log(error); // Gérer les erreurs éventuelles
      }
    );
  }

}
