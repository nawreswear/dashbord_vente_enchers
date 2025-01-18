import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserServiceService } from '../user-service.service';
import { TokenStorageService } from 'src/app/_service/token-storage.service';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/_service/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Article } from 'src/app/signalement.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  photoUrl: string = '';
  private type: string[];
  isLoggedIn = false;
  nom: string | null = null; 
  photoNom: string = '';
  showAdminBoard = false;
  showVendeurBoard = false;
  username: string;
  public errorMsg: any[] = [];
  public divTop = '-200px';
  searchValue: string | null = null;
  menuOpened: boolean = false;
  currentPath: string | null = '';
  userData: User | null = null;
  userMenu: boolean = false;
  showUserInfo = false;
  capitalizedPassword: string = '';
  constructor(private tokenStorageService: TokenStorageService, private translateService: TranslateService,
    private router: Router,
    private authenticationService: AuthService,
    public authService: AuthService,private userService: UserServiceService) {
    this.type = [];
    this.username = '';
  
      this.router.events.subscribe((path: any) => {
        this.currentPath = path?.routerEvent?.url;
        this.menuOpened = false;
      });
      this.authenticationService.userDataObs$.subscribe({
        next: (value) => {
          this.userData = value;
        },
      });
    }
    articles: Article[] = [];

    
    
    toggleUserInfo() {
      this.showUserInfo = !this.showUserInfo;
      console.log('showUserInfo:', this.showUserInfo);
    }
    searchQuery: string = '';

   
   

  ngOnInit(): void {
  
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    this.getUserPhoto();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      if (user) {
      }
    }

    this.userService.getAllUsers().subscribe(
      (users: User[]) => {
        if (users.length > 0) {
          this.errorMsg = users.map((user: any) => ({
            nom: user.nom,
            id: user.id,
            prenom: user.prenom,
            email: user.email,
            tel: user.tel,
            codePostal: user.codePostal,
            longitude: user.longitude,
            latitude: user.latitude,
            pays: user.pays,
            ville: user.ville,
            errorMessage: `Erreur: La quantité pour ${user.nom} est de 0. Veuillez mettre à jour la quantité.`,
          }));
        } else {
          console.error("Erreur: Aucune donnée retournée par la requête.");
        }
      },
      (error: any) => { 
        console.error("Une erreur est survenue lors de la récupération des utilisateurs :", error);
      }
    );
    this.capitalizeFirstLetter();
  }
  capitalizeFirstLetter(): void {
    const password = this.authService.getUserPassword();
    // Vérifiez si la valeur est définie et non vide
    if (password) {
      // Capitalisez la première lettre de la chaîne de caractères
      this.capitalizedPassword = password.charAt(0).toUpperCase() + password.slice(1);
    }
  }  

    logout() {
      // Clear user data
      localStorage.removeItem('token');
      localStorage.removeItem('type');
      // Refresh the page
      window.location.reload();
      // Optional: Navigate to the login page
      // this.router.navigate(['/login']);
    }
    getUserPhoto(): void {
     // console.log("this.nom : ", this.nom);
      this.nom = this.authService.getUserPassword();
      if (this.nom !== null) {
        this.authService.getPhotoByName(this.nom).subscribe(
          (photoUrl: string) => {
           // console.log("l'image récupéréeee:", this.photoUrl);
            this.photoUrl = photoUrl;
            //console.log("l'image récupérée:", this.photoUrl);
          },
          (error: any) => {
            console.error('Erreur lors de la récupération de l\'URL de l\'image:', error);
          }
        );
      } else {
        console.error('La valeur de this.nom est null. Impossible de récupérer l\'URL de l\'image.');
      }
    }
}