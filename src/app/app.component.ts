import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from './_service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  currentPath: string | null = '';
  userType: string | string[] | null;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private authService:AuthService
  ) {
  
    this.userType = this.authService.getUserType();
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Vérifier le statut de connexion
        this.isLoggedIn = this.authService.isLoggedIn();
        // Vérifier le statut d'administration
        this.isAdmin = this.authService.isAdmin();
        // Mettre à jour le type d'utilisateur
        this.userType = this.authService.getUserType();
        // Mettre à jour le chemin actuel
        this.currentPath = this.router.url;

        // Rediriger si l'utilisateur n'est pas administrateur et tente d'accéder à une page d'administration
        if (!this.isAdmin && this.isOnAdminDashboard()) {
          //this.router.navigate(['/not-found']);
        }
      }
    });
  }


  isLoginOrSignup(): boolean {
    return this.currentPath === '/register' || this.currentPath === '/login';
  }
  isArticlesPageOrCategoriesPage(): boolean {
    return this.currentPath === '/articles' || this.currentPath === '/categories' ;
  }
  
  isOnAdminDashboard(): boolean {
    return !!this.currentPath && ( this.currentPath.startsWith('/admin') || 
    this.currentPath.startsWith('/overview') || 
    this.currentPath.startsWith('/users') || 
    this.currentPath.startsWith('/header') || 
    this.currentPath.startsWith('/enchers') || 
    this.currentPath.startsWith('/article') || 
    this.currentPath.startsWith('/categorie') || 
    this.currentPath.startsWith('/demande-vendeur') || 
    this.currentPath.startsWith('/commentaires') ||
    this.currentPath.startsWith('/signalisation')
  );
  }
  
 
 
}
