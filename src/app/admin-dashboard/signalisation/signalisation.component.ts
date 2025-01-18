import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_service/user';
import { SignalementService } from 'src/app/signalement.service';
import { UserServiceService } from '../user-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ArticleService } from '../article.service';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { EnchereService } from '../enchers-service.service';
import { EnchersServiceService } from 'src/app/enchers-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

interface Signalement {
  id: number;
  message: string;
  article: Article;
  date: Date;
  user: User;
  users: User[];
  type: string;
  errorText?: string;
}

interface Article {
  id: number;
  titre: string;
  photo: string;
  description: string;
  quantiter: number;
  prix: number;
  livrable: boolean;
  statut: string;
 
  vendeur: User;
  categorie: Categorie;
}

interface Categorie {
  id: number;
  titre: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-signalisation',
  templateUrl: './signalisation.component.html',
  styleUrls: ['./signalisation.component.css']
})
export class SignalisationComponent implements OnInit {
  signalements: Signalement[] = [];
  photoUrl: string = '';
 user:User| undefined;
  showAlert: boolean = false; 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  users: MatTableDataSource<User> = new MatTableDataSource<User>();
  vendeurNames: { [key: number]: string } = {}; // Objet pour stocker les noms de vendeurs associés aux IDs d'article

  constructor(private signalementService: SignalementService,private userService: UserServiceService,
   private articleService :ArticleService,private encherService:EnchersServiceService,   private snackBar: MatSnackBar,

  ) { }

  ngOnInit(): void {
    this.getAllSignalements();
    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = new MatTableDataSource<User>(data);
        this.users.paginator = this.paginator;
        this.users.sort = this.sort;
      },
      (error: any) => {
        console.error("Une erreur est survenue lors de la récupération des utilisateurs :", error);
      }
    );
  }

  hideAlert(): void {
    this.showAlert = false;
  }


 getAllSignalements(): void {
    this.signalementService.getAllSignalements().subscribe(
      (signalements: Signalement[]) => {
        this.signalements = signalements;
        // Pour chaque signalement, récupérer le vendeur et gérer les erreurs
        this.signalements.forEach(signalement => {
          this.getVendeurByArticleId(signalement);
        });
      },
      (error: any) => {
        console.error(' signalements:', error.error.text);
      }
    );
  }

  getVendeurByArticleId(signalement: Signalement): void {
    this.articleService.getVendeurByArticleId(signalement.article.id).subscribe(
      (vendeurId: number) => { // Changer le type de vendeurId en number
        console.log('ID du vendeur pour l\'article', signalement.article.id, ':', vendeurId);
        // Si aucune erreur n'est survenue, réinitialisez l'erreur de ce signalement
        if (vendeurId === 0) {
          signalement.errorText = 'Admin';
        } else {
          this.signalementService.getUserById(vendeurId).subscribe(
            (user: User) => {
              this.user = user;
              signalement.errorText = user.nom + ' ' + user.prenom; // Exemple de traitement avec les données de l'utilisateur
            },
            (error: any) => {
              console.error('Erreur lors de la récupération de l\'utilisateur :', error);
              signalement.errorText = 'Erreur lors de la récupération de l\'utilisateur';
            }
          );
        }
      },
      (error: any) => {
        signalement.errorText = `${error.error.text}`;
      }
    );
  }
  
  shouldShowDeleteButton(articleId: number): boolean {
    const signalementsForArticle = this.signalements.filter(signalement => signalement.article.id === articleId);
    return signalementsForArticle.length >= 10;
  }
  countSignalements(vendeurId: string): number {
    return this.signalements.filter(signalement => signalement.article.vendeur.id === vendeurId).length;
  }

  isVendeurDeletable(article: Article): boolean {
    return article && article.vendeur && this.countSignalements(article.vendeur.id) === 10;
  }
  deleteVendeur(errorText: string ) {
    this.encherService.findUserIdByNom(errorText).subscribe(
      userId => {
        console.log('ID de l\'utilisateur trouvé :', userId);
        // Convertir l'ID de l'utilisateur en chaîne de caractères ==>toString()
        this.signalementService.updatevendeurType(userId).subscribe(
          (response) => {
            console.log('Retour de la mise à jour du type de vendeur :', response);
            this.snackBar.open('la mise à jour du type de vendeur est fait avec succès ', 'Fermer', {
              duration: 3000
            });
            // Gérez ici la réponse retournée par la mise à jour du type de vendeur
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du type de vendeur :', error);
            // Gérez ici les erreurs lors de la mise à jour du type de vendeur
          }
        );
        console.log('ID de l :', this.signalementService.updatevendeurType(userId));
      },
      error => {
        console.error('Erreur lors de la récupération de l\'ID de l\'utilisateur :', error);
      }
    );
  }
  deleteArticle(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet article?')) {
      this.signalementService.deleteArticle(id).subscribe(
        response => {
          if (typeof response === 'string') {
            this.snackBar.open('Article supprimé avec succès!', 'Fermer', {
              duration: 3000
            });
          }
        },
        (error: HttpErrorResponse) => {
          console.error("Erreur lors de la suppression de l'article:", error.error);
          this.snackBar.open('Erreur lors de la suppression de l\'article: ' + error.error, 'Fermer', {
            duration: 3000,
          });
        }
      );
    }
  }
  
  deleteAllSignalementsForArticle(id: number) {
    this.signalementService.deleteAllSignalementsForArticle(id).subscribe(
      () => {
        console.log('Signalement supprimé avec succès.');
        this.deleteArticle(id);
        this.refreshSignalement();
      },
      (error) => {
        console.error('Erreur lors de la suppression du signalement :', error);
      }
    );
  }

  refreshSignalement(): void {
    this.signalementService.getAllSignalements().subscribe(
      signalements => {
        this.signalements = signalements;
      },
      error => {
        console.error("Erreur lors de la récupération des signalements :", error);
      }
    );
  }
}
