import { Component, EventEmitter, Output } from '@angular/core';
import { demandevendeurService } from '../demandevendeur.service';
import { Vendeur } from '../vendeur';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
interface demande_Vendeur {
  id: number | undefined;
  datedem: Date;
  etatdem: boolean;
  user: number | undefined;
}
@Component({
  selector: 'app-demandevendeur',
  templateUrl: './demandevendeur.component.html',
  styleUrls: ['./demandevendeur.component.css']
})
export class DemandevendeurComponent {
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  vendeur = new Vendeur();
  messageSuccessVisible: boolean = false;
  messageErreurVisible: boolean = false;
  messageErreur: string = '';
  userIdd: number | undefined;
  constructor(private demandevendeurservice: demandevendeurService, private snackBar: MatSnackBar,
    public router: Router) {
      this.getUserId(); 
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log("storedTokennnn", storedToken);
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      console.log(tokenPayload);
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        console.log('Nom utilisateur :', username);
      } else {
        console.log('Aucun nom d\'utilisateur trouvé dans le token');
      }
      this.token.next(storedToken);
    }
    this.tokenObs$.subscribe({
      next: (token) => {
        if (!token) router.navigate(['/']);
      },
    });
  }

  @Output() demandeEnvoyee = new EventEmitter<Vendeur>();

  envoyerDemandeVendeur() {
    console.log('Validation du formulaire réussie. Envoi des données du formulaire...');
  
    // Assurez-vous que this.userIdd contient une valeur numérique valide avant de l'utiliser
    if (typeof this.userIdd === 'number') {
      const demandeVendeur: demande_Vendeur = {
        id: undefined,
        datedem: new Date(),
        etatdem: false,
        user: this.userIdd // Utilisez this.userIdd avec l'ID de l'utilisateur
      };
  
      this.demandeEnvoyee.emit(this.vendeur);
      this.demandevendeurservice.createDemandeVendeur(demandeVendeur, this.userIdd).subscribe(
        () => {
          console.log('Soumission du formulaire réussie.');
          this.vendeur = new Vendeur();
          this.messageSuccessVisible = true;
          this.snackBar.open('La demande est envoyer avec succès!', 'Fermer', {
            duration: 3000
          });
        },
        error => {
          console.error('Erreur lors de l\'envoi de la demande :', error);
          this.snackBar.open('Erreur lors de l\'envoi de la demande!', 'Fermer', {
            duration: 3000
          });
          if (error.status === 500) {
            this.messageErreur = 'Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.';
          } else {
            this.messageErreur = 'Une erreur s\'est produite lors de l\'envoi du formulaire. Veuillez réessayer plus tard.';
          }
          this.messageErreurVisible = true;
        }
      );
    } else {
      console.error('La valeur de userId n\'est pas une valeur numérique valide :', this.userIdd);
    
      // Gérer cette situation d'erreur selon vos besoins
    }
  }
  
  getUserId(): void {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        this.demandevendeurservice.findUserIdByNom(username).subscribe(
          id => {
            console.log('ID utilisateur :', id);
            this.userIdd = id; // Affectez la valeur de l'ID à la propriété userId
          },
          error => {
            console.error('Erreur lors de la récupération de l\'ID utilisateur :', error);
            this.userIdd = 0; // En cas d'erreur, affectez une valeur par défaut
          }
        );
      }
    } else {
      this.userIdd = 0; // Si aucun token n'est présent, affectez une valeur par défaut
    }
  }
  validerFormulaire(): boolean {
    return true;
  }

  annulerFormulaire() {
    this.vendeur = new Vendeur();
  }
}