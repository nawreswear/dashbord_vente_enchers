import { Component, Inject } from '@angular/core';
import { SignalementService } from '../signalement.service';
import { User } from '../_service/user';
import { PartEnService } from '../part-en.service';
import { EnchersServiceService } from '../enchers-service.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Categorie } from '../admin-dashboard/paiment/paiment.component';

export interface Signalement {
  id: number;
  message: string;
  date: Date;
  article:Article,
  user: User; 
  users: User[];
  type: string;
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
  vendeur: User;
  categorie: Categorie;
}
@Component({
  selector: 'app-signalement',
  templateUrl: './signalement.component.html',
  styleUrls: ['./signalement.component.css']
})
export class SignalementComponent {
  // Propriétés pour stocker les informations du nouveau signalement
  message: string = '';
  article: Article | undefined;
  signalemet: Signalement[] = []; 
  type: string = '';
  username: string = '';
  userId: number | undefined;
  user: User = {
    id: '', // Définir une valeur initiale pour l'ID
    nom: '',
    email: '',
    password: '',
    prenom: '',
    tel: '',
    type: [],
    codePostal: 0,
    pays: '',
    ville: '',
    cin: 0,
    longitude: 0,
    latitude: 0,
    photo: ''
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { article: Article },
    private signalementService: SignalementService,
    private encherService: EnchersServiceService,
    private partEnService: PartEnService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SignalementComponent>,
  ) { }

  ngOnInit(): void {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        this.username = tokenPayload.sub;
        this.encherService.findUserIdByNom(this.username).subscribe(
          userId => {
            console.log('ID de l\'utilisateur trouvé :', userId);
            this.userId = userId; // Initialisation de la propriété userId
            // Utilisez l'ID de l'utilisateur pour récupérer ses informations
            this.signalementService.getUserById(this.userId).subscribe(
              user => {
                console.log('Informations de l\'utilisateur trouvé :', user);
                this.user = user; // Remplissez la propriété user avec les informations de l'utilisateur
              },
              error => {
                console.error('Erreur lors de la récupération des informations de l\'utilisateur :', error);
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

  refreshsignale(): void {
    this.signalementService.getAllSignalements().subscribe(
      signalemet => {
        this.signalemet = signalemet;
        // Fermer la fenêtre après la mise à jour des commentaires
        this.dialogRef.close();
      },
      error => {
        console.error("Erreur lors de la récupération des commentaires :", error);
      }
    );
  }
  // Méthode pour ajouter un nouveau signalement
  addSignalement() {
   // this.user=this.signalementService.getUserById(this.userId );
    // Créer un nouvel objet Signalement avec les informations saisies
    const newSignalement: Signalement = {
      id: 0, // L'ID sera ignoré ou généré automatiquement côté serveur
      message: this.message,
      article:this.data.article,
      date: new Date(), // Date actuelle
      user: this.user, // Utiliser la propriété user au lieu de l'observable
      users: [this.user], // Remplissez avec les utilisateurs concernés si nécessaire
      type: this.type
    };

    // Appeler la méthode saveSignalement du service pour enregistrer le nouveau signalement
    this.signalementService.saveSignalemente(newSignalement).subscribe(
      (response) => {
        console.log('Nouveau signalement ajouté :', response);

        // Réinitialiser les champs après l'ajout réussi
        this.message = '';
        this.type = '';
        this.refreshsignale();
        this.snackBar.open('Signalement envoyé avec succès.', 'Fermer', {
          duration: 3000,
      });
      },
     
      (error) => {
        console.error('Erreur lors de l\'ajout du signalement :', error);
        // Gérer les erreurs si nécessaire
      }
    );
  }

  fermer(): void {
    this.dialogRef.close();
  }
}
