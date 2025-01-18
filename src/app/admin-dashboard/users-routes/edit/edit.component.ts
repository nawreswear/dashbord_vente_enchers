import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { User } from 'src/app/_service/user';
import { UserServiceService } from '../../user-service.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class UserEditComponent implements OnInit {
  userForm!: FormGroup; // Utilisation de ! pour indiquer que userForm sera initialisé plus tard
  user: User = new User();
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserServiceService,
    private formBuilder: FormBuilder,
    private location: Location // Injection du service Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['userId'];
      this.userService.getUserById(userId).subscribe(data => {
        this.user = data;
        // Initialize the form after fetching user data
        this.initForm();
      });
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
  initForm(): void {
    this.userForm = this.formBuilder.group({
      nom: [this.user.nom, Validators.required],
      prenom: [this.user.prenom, Validators.required],
      type: [this.user.type, Validators.required],
      tel: [this.user.tel, Validators.required],
      email: [this.user.email, Validators.required],
      cin: [this.user.cin, Validators.required],
      password: [this.user.password, Validators.required],
      photo: [this.user.photo, Validators.required],
    });
  }

  onSubmit(): void {
    this.userService.update(this.user.id, this.user).subscribe(data => {
      this.router.navigate(['/users']);
    });
  }

  goBack(): void {
    this.location.back();
  }
}
