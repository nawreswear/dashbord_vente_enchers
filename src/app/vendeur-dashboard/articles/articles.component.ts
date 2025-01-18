import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/_service/auth.service';
import { HttpClient } from '@angular/common/http';
import { ArticleService } from 'src/app/article.service'; // Assurez-vous d'importer le service ArticleService approprié
import { EnchersServiceService } from 'src/app/enchers-service.service';
import { Location } from '@angular/common';
interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  livrable: boolean;
  statut: string;
  quantiter: number; 
  vendeur: { id: number };
  categorie: { id: number };
}
interface Categorie {
  id: number; 
  titre: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesVendeurComponent implements OnInit {
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();

  nomVendeur: string = ''; // Ajout de la variable pour le nom du vendeur
  articleForm: FormGroup;
  articles: Article[] = [];
  categories: Categorie[] = []; 
  nomUtilisateur: string | null = null;
  constructor(private http: HttpClient,
    private fb: FormBuilder, private encherService: EnchersServiceService,
    private articleService: ArticleService, // Utilisation du service ArticleService
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,private location: Location
  ) {
    this.articleForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      livrable: [false],
      statut: [''],
      quantiter: [0],
      categorie: [0, Validators.required],
    });
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log("storedTokennnn",storedToken);
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      console.log(tokenPayload);
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        console.log('Nom utilisateur :', username);
    } else {
        console.log('Aucun nom d\'utilisateur trouvé dans le token');
    }
      this.token.next(storedToken);
      //this.decodeToken();
    }
    this.tokenObs$.subscribe({
      next: (token) => {
        if (!token) router.navigate(['/']);
      },
    });
    this.articleService.getAllCategories().subscribe(
      (categories: Categorie[]) => {
        this.categories = categories;
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.snackBar.open('Erreur lors du chargement des catégories!', 'Fermer', {
          duration: 3000
        });
      }
    );
  }
  ngOnInit(): void {
    // Appelez la fonction pour récupérer le nom de l'utilisateur
    this.nomUtilisateur = this.authService.getUserPassword();
    this.getAllArticles();
  }
  findUserIdByNom(nomuser: string): Observable<number> {
    return this.http.get<number>(`http://localhost:3003/api/${nomuser}`).pipe(
      catchError(error => {
        let errorMessage = 'Une erreur s\'est produite lors de la recherche de l\'utilisateur.';
        if (error.status === 404) {
          errorMessage = `Utilisateur non trouvé avec le nom : ${nomuser}`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }
  goBack(): void {
    this.location.back();
  }
  submitArticle() {
    if (this.articleForm.valid) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log("storedTokennnn",storedToken);
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log(tokenPayload);
        if (tokenPayload.sub) {
          const username = tokenPayload.sub;
          console.log('Nom vendeur :', username);
          // Utilisation directe de tokenPayload.sub pour récupérer le nom d'utilisateur
          this.findUserIdByNom(username).subscribe( vendeurId => {
              console.log('ID de vendeur trouvé :', vendeurId);
              // Ajoutez l'ID du vendeur aux données de l'article
              const articleData = { ...this.articleForm.value, vendeur: vendeurId };
              this.articleService.addArticleWithVendeurId(articleData, vendeurId).subscribe(
                () => {
                  this.snackBar.open('Article ajouté avec succès !', 'Fermer', { duration: 3000 });
                  window.location.reload()
                  this.getAllArticles();
                  this.articleForm.reset();
                },
                (error: HttpErrorResponse) => {
                  console.error('Erreur lors de l\'ajout de l\'article :', error);
                  this.snackBar.open('Erreur lors de l\'ajout de l\'article !', 'Fermer', { duration: 3000 });
                }
              );
            }
          );
        } else {
          this.snackBar.open('Impossible de récupérer le nom de l\'utilisateur à partir du token.', 'Fermer', { duration: 3000 });
        }
      } else {
        this.snackBar.open('Aucun token trouvé dans le stockage local.', 'Fermer', { duration: 3000 });
      }
    } else {
      this.snackBar.open('Veuillez remplir tous les champs du formulaire.', 'Fermer', { duration: 3000 });
    }
  }

  getAllArticles() {
    this.articleService.getAllArticles().subscribe(
      (articles: Article[]) => {
        this.articles = articles;
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des articles:', error);
        this.snackBar.open('Erreur lors du chargement des articles!', 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  cancel() {
    this.articleForm.reset();
    window.history.back();
  }

 

}
