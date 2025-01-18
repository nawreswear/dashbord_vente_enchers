import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { UserServiceService } from 'src/app/admin-dashboard/user-service.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})

export class NewUserComponent {
  errorMessage: string = ''; 
  @ViewChild('myModal') myModal!: ElementRef;
  display = "none";
  userForm: FormGroup;
  
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment
  constructor(
    private fb: FormBuilder, private snackBar: MatSnackBar,
    private clientService: UserServiceService,
    private toastr: ToastrService
  ) {
    // Initialisation du FormGroup pour le formulaire d'ajout d'utilisateur
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      type: ['', Validators.required],
      tel: ['', Validators.required],
      email: ['', Validators.required],
      cin: ['', Validators.required],
      password: ['', Validators.required],
     // photo: ['', Validators.required],
    });
  }

  isValidURL(url: string): boolean {
    // Vérifie si l'URL est vide
    if (!url) {
        return false;
    }

    // Expression régulière pour valider les URL
    const urlPattern = new RegExp('^https?://.*', 'i');
    // Test si l'URL correspond au modèle d'URL
    return urlPattern.test(url);
  }

  addUser() {
    // Réinitialiser errorMessage à une chaîne vide à chaque fois que vous lancez cette méthode
    this.errorMessage = '';
  
    // Vérifier si le formulaire est valide
    if (this.userForm.valid) {
      this.clientService.addUser(this.userForm.value).subscribe(
        (data) => {
          console.log("Utilisateur ajouté avec succès", data);
          this.toastr.success('Utilisateur ajouté avec succès !');
          this.closeModal();
          // Réinitialiser le formulaire après l'ajout réussi
          this.userForm.reset();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        (error: any) => {
         
          // Gestion des erreurs
          if (error.status === 400 && error.error && error.error.message === 'Adresse e-mail déjà utilisée') {
            this.snackBar.open('L\'adresse e-mail est déjà utilisée.', 'Close', {
              duration: 3000
            });
          } else {
          
            this.snackBar.open('L\'adresse e-mail est déjà utilisée.', 'Close', {
              duration: 3000
            });
          }
        }
      );
    } else {
      // Gérer le cas où le formulaire n'est pas valide
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      this.snackBar.open('Veuillez remplir tous les champs obligatoires correctement.', 'Close', {
        duration: 3000
      });
    }
  }
  
  openModal() {
    this.display = 'block';
  }
  
  closeModal() {
    this.display = 'none';
  }
}
