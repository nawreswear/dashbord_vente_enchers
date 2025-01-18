import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../_service/auth.service';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { UserService } from '../_service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @ViewChild('f') signupForm!: NgForm;
  form: any = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    tel: '',
    type: '',
    cin: '',
    photo: ''
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, private http: HttpClient,
    private userService: UserService, private router: Router) { } // Injecter le service Router

  ngOnInit(): void {
  }

  onSubmit() {
    console.log(this.form);
    this.authService.register(this.form).subscribe(
      (data: any) => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        // Rediriger vers la page de connexion après une inscription réussie
        this.router.navigate(['/login']);
      },
      (err: any) => {
        console.error(err);
        if (err && err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = "Une erreur s'est produite lors de l'inscription.";
        }
        this.isSignUpFailed = true;
      }
    );
  }
}
