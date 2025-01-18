import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Commentaire, CommentaireService } from '../commentaire.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../_service/auth.service';
import { EnchersServiceService } from '../enchers-service.service';
import { PartEnService } from '../part-en.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'modification-commentaire',
  templateUrl: './modification-commentaire.component.html',
  styleUrls: ['./modification-commentaire.component.css']
})
export class ModificationCommentaireDialog {
  commentaireAModifier: Commentaire;
  username: string = '';
  commentaires: Commentaire[] = []; 
  commentaire: Commentaire | null = null;
  userId: number | undefined;
  isModificationActive: boolean = false; // Déclarer la propriété 'isModificationActive'
  editMode: boolean = false; // Déclarer la propriété 'editMode'
  editCommentaire: Commentaire | null = null; // Déclarer la propriété 'editCommentaire'
  editForm!: FormGroup;
  constructor(
    private commentaireService: CommentaireService,
    private snackBar: MatSnackBar,
    private encherService: EnchersServiceService,
    private partEnService: PartEnService,
    private authService: AuthService,private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ModificationCommentaireDialog>,
    @Inject(MAT_DIALOG_DATA) 
    public data: Commentaire
  ) {
    this.commentaireAModifier = { ...data }; // Copie du commentaire
    this.editForm = this.formBuilder.group({
      objet: [''], 
      message: [''], 
      date: new Date()
    });
  }

  appliquer(): void {
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

                // Modifiez le commentaire avec l'ID de l'utilisateur connecté
                if (this.userId !== undefined) { // Vérifiez que userId n'est pas undefined
                  this.commentaireAModifier.user.id = this.userId; // Ajouter l'ID de l'utilisateur au commentaire
                  this.modifierCommentaire(this.commentaireAModifier.id, this.commentaireAModifier); // Appeler la méthode pour modifier le commentaire
                } else {
                  console.error('Impossible de modi<fier le commentaire: ID de l\'utilisateur non défini');
                }
              },
              error => {
                console.error('Erreur lors de la récupération de l\'ID du partenaire :', error);
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
  modifierCommentaire(idCommentaire: number, commentaire: Commentaire) {
    console.log("ID du commentaire à modifier :", idCommentaire);
    console.log("Commentaire à modifier :", commentaire);
    const requestBody = {
      commentaireId: idCommentaire,
      commentaire: commentaire
    };

    console.log('Données envoyées : ', requestBody);
    // Vérifier si commentaire est défini avant d'accéder à la propriété id
    if (commentaire && commentaire.id) {
        this.commentaireService.mettreAJourCommentairePourArticle(commentaire.article.id, idCommentaire, commentaire)
        .subscribe(
            (data: Commentaire) => {
            console.log("Commentaire modifié :", data);
            // Rafraîchir les commentaires après la modification
            this.refreshCommentaires(); // Appel de la fonction pour rafraîchir les commentaires
            // Afficher le snackbar
            this.snackBar.open('Commentaire modifié avec succès', 'Fermer', {
                duration: 2000,
            });
            },
            error => {
            console.error("Erreur lors de la modification du commentaire :", error);
            // Affichez l'erreur dans la console
            this.snackBar.open('Erreur lors de la modification du commentaire', 'Fermer', {
                duration: 2000,
            });
            console.log("Le corps de la demande était :", error.error);
            }
        );
    } else {
        console.error('Impossible de modifier le commentaire : ID du commentaire non défini');
        this.snackBar.open('Erreur lors de la modification du commentaire', 'Fermer', {
            duration: 2000,
        });
    }
}

refreshCommentaires(): void {
  this.commentaireService.getAllCommantaires().subscribe(
    commentaires => {
      this.commentaires = commentaires;
      // Fermer la fenêtre après la mise à jour des commentaires
      this.dialogRef.close();
    },
    error => {
      console.error("Erreur lors de la récupération des commentaires :", error);
    }
  );
}

  fermer(): void {
    this.dialogRef.close();
  }
}
