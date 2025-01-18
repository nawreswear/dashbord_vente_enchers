import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../article.service';
import { Commentaire, CommentaireService } from '../commentaire.service';
import { PartEnService } from '../part-en.service';
import { EnchersServiceService } from '../enchers-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModificationCommentaireDialog } from '../modification-commentaire/modification-commentaire.component';

import {  MatDialog } from '@angular/material/dialog';

interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  prixvente?: number;
  livrable: boolean;
  statut: string;
  quantiter: number;
  vendeur: { id: number };
  categorie: Categorie;
}
interface Categorie {
  id: number;
  titre: string;
  description: string;
  image: string;
}
@Component({
  selector: 'app-detail-art',
  templateUrl: './detail-art.component.html',
  styleUrls: ['./detail-art.component.css']
})
export class DetailArtComponent implements OnInit {
  commentaires: Commentaire[] = []; 
  selectedArticle: Article | null = null;
 public isZoomed = false;
 zoomedImageScale = 1; 
 username:string ='';
 selectedArticleId: number;
 photo:string='';
 articleId: number | undefined;
 afficherTousLesCommentaires = false;
 showOptions: boolean = false;
 userId: number | undefined; 
 selectedCommentIndex: number = -1;

 nouveauCommentaire: Commentaire = {
   id: 0,
   object: '',
   message: '',
   date: new Date(),
   article: { id: 0},
   user: { id: 0 ,nom:'',photo:''} // Valeur par défaut pour user.id
 };
  constructor(public router: Router,
    private route: ActivatedRoute,  private encherService: EnchersServiceService, 
    private partEnService: PartEnService,
    private articleService: ArticleService,
  private commentaireService: CommentaireService ,private snackBar: MatSnackBar ,public dialog: MatDialog
  ) {
    this.selectedArticleId = 0;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const articleId = +params['id']; 
      this.articleService.getArticleById(articleId).subscribe(article => {
        this.selectedArticle = article; 
        this.selectedArticleId = articleId; 
        this.getCommentairesPourArticle(articleId); 
        this.refreshCommentaires(articleId);
      });
    });
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
         this.username = tokenPayload.sub;
        this.encherService.findUserIdByNom(this.username).subscribe(
          userId => {
            console.log('ID de l\'utilisateur trouvé :', userId);
            this.userId = userId; // Initialisation de la propriété userId
            // Maintenant, vous avez l'ID de l'utilisateur, vous pouvez récupérer le partenaire ID
            this.partEnService.getPartenIdByUserId(userId).subscribe(
              partenId => {
                console.log('ID du partenaire trouvé :', partenId);
                // Faites ce que vous devez faire avec l'ID du partenaire ici
              },
              error => {
                //console.error('Erreur lors de la récupération de l\'ID du partenaire :', error);
              }
            );
          },
          error => {
            console.error('Erreur lors de la récupération de l\'ID de l\'utilisateur :', error);
          }
        );
      }
    }
  }

toggleOptions(index: number): void {
    this.selectedCommentIndex = (this.selectedCommentIndex === index) ? -1 : index;
    console.log("Options affichées pour le commentaire à l'index", index, ":", this.selectedCommentIndex === index);
}

supprimerCommentaire(commentaire: Commentaire): void {
  this.commentaireService.supprimerCommentairePourArticle(commentaire.article.id, commentaire.id)
    .subscribe(
      () => {
        console.log("Commentaire supprimé :", commentaire);
        // Rafraîchir les commentaires après la suppression
        this.refreshCommentaires(this.selectedArticleId);
        // Afficher le snackbar
        this.snackBar.open('Commentaire supprimé avec succès', 'Fermer', {
          duration: 2000,
        });
      },
      error => {
        console.error("Erreur lors de la suppression du commentaire :", error);
        // Gérez l'erreur si nécessaire
      }
    );
}

ouvrirFenetreModification(commentaire: Commentaire): void {
  this.dialog.open(ModificationCommentaireDialog, {
    width: '400px',
    data: commentaire
  });
}
refreshCommentaires(articleId: number): void {
  this.commentaireService.getCommentairesParIdArticle(articleId)
    .subscribe(
      commentaires => {
        this.commentaires = commentaires; // Mettre à jour le tableau de commentaires
        console.log('Commentaires récupérés avec succès :', this.commentaires);
      },
      error => {
        console.error('Erreur lors de la récupération des commentaires :', error);
      }
    );
}


modifierCommentaire(commentaire: Commentaire): void {
  console.log("ID du commentaire à modifier :", commentaire.id); // Affichage de l'ID du commentaire
  this.commentaireService.mettreAJourCommentairePourArticle(commentaire.article.id, commentaire.id, commentaire)
    .subscribe(
      (data: Commentaire) => {
        console.log("Commentaire modifié :", data);
        // Rafraîchir les commentaires après la modification
        this.refreshCommentaires(this.selectedArticleId);
        // Afficher le snackbar
        this.snackBar.open('Commentaire modifié avec succès', 'Fermer', {
          duration: 2000,
        });
      },
      error => {
        console.error("Erreur lors de la modification du commentaire :", error);
        // Gérez l'erreur si nécessaire
      }
    );
}

  getCurrentUserId() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        return tokenPayload.sub;
      }
    }
    return null;
  }
  
// Add this to your component's code
getCommentairesPourArticle(articleId: number): void {
  this.commentaireService.getCommentairesParIdArticle(articleId)
    .subscribe(
      commentaires => {
        this.commentaires = commentaires; // Mettre à jour le tableau de commentaires
        console.log('Commentaires récupérés avec succès :', this.commentaires);
        this.refreshCommentaires(articleId);
      },
      error => {
        console.error('Erreur lors de la récupération des commentaires :', error);
      }
    );
}

ajouterCommentaire() {
  // Afficher l'objet nouveauCommentaire dans la console pour vérifier ses propriétés
  console.log("Nouveau commentaire :", this.nouveauCommentaire);
  // Vérifier si userId est défini
  if (this.userId === undefined) {
    console.error("L'identifiant de l'utilisateur est manquant.");
    return;
  }

  // Vérifier si selectedArticle est défini
  if (!this.selectedArticle) {
    console.error("Aucun article sélectionné.");
    return;
  }

  // Mettre à jour l'ID de l'article dans nouveauCommentaire
  this.nouveauCommentaire.article.id = this.selectedArticle.id;

  // Créer un objet Commentaire avec la propriété 'article' et 'user' pour correspondre au type attendu
  const commentaire: Commentaire = {
    id: this.nouveauCommentaire.id,
    object: this.nouveauCommentaire.object,
    message: this.nouveauCommentaire.message,
    date: this.nouveauCommentaire.date,
    article: { id: this.selectedArticle.id },
    user: { id: this.userId ,nom: this.username ,photo: this.photo}
  };

  // Envoyer le commentaire au service
  this.commentaireService.ajouterCommentairePourArticle(this.selectedArticle.id, commentaire).subscribe(
    (data) => {
      this.nouveauCommentaire.object = '';
      this.nouveauCommentaire.message = '';
      console.log('Commentaire ajouté avec succès :', data);
      this.snackBar.open('Commentaire ajouté avec succès', 'Fermer', {
        duration: 2000,
      });
      this.refreshCommentaires(this.selectedArticleId);
    },
    (error) => {
      console.error('Une erreur est survenue lors de l\'ajout du commentaire : ', error);
      this.snackBar.open('Une erreur  lors de l\'ajout du commentaire ', 'Fermer', {
        duration: 2000,
      });
    }
  );
}


toggleZoom() {
  this.isZoomed = !this.isZoomed;
}

showCommentaireDetails(article: Article) {
  // Naviguer vers la page de détail de l'article avec son ID comme paramètre
  this.router.navigate(['/commentaire/', article.id]);
}
  closeArticleDetails() {
    this.router.navigate(['/articles/']);
  }
}
