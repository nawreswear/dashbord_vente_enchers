import { Component, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../article.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  livrable: boolean;
  statut: string;
  quantiter: number;
  categorie: Categorie;
  enchere_id:string
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
export class ArticlesAdminComponent implements OnInit {
  displayedColumns = ['titre', 'description', 'photo', 'prix', 'livrable', 'status', 'quantiterr', 'categorie', 'actions'];
  editMode: boolean = false;
  articles: Article[] = [];
  editArticle: Article | null = null;
  loading: boolean = false;
  photoUrl: string = '';
  myForm!: FormGroup;
  categories: Categorie[] = [];
  urlPattern = new RegExp('^(https?:\\/\\/)?' + // Protocole
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Nom de domaine
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // Ou une adresse IP (v4) 
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port et chemin
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // Paramètres de requête
    '(\\#[-a-z\\d_]*)?$', 'i'); // Fragment
  editForm!: FormGroup;
  onCreatee = false;
  newArticle: Article = {
    id: 0,
    titre: '',
    description: '',
    photo: '',
    prix: '',
    livrable: false,
    statut: '',
    quantiter: 0,
    enchere_id:'',
    categorie: { id: 0, titre: 'Default Category', description: '', image: '' }
  };
  
  constructor(private http: HttpClient,
    private formBuilder: FormBuilder,
    private articleService: ArticleService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getAllCategories();
    this.getAllArticles();
    this.initializeForms();
  }

  getAllCategories() {
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
  filteredArticles: Article[] = [];
  searchArticles(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    // Si la requête de recherche est vide, afficher tous les articles
    if (!query.trim()) {
        this.filteredArticles = this.articles;
        console.log("ccc",this.filteredArticles );
    } else {
        // Filtrer les articles dont le titre contient la requête de recherche
        this.filteredArticles = this.articles.filter(article =>
            article.titre.toLowerCase().includes(query)
        
        );
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

  initializeForms() {
    this.myForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      prixvente: [''],
      livrable: [false, Validators.required],
      statut: ['', Validators.required],
      quantiter: [0, Validators.required],
      categorie: [null, Validators.required], 
      enchers_id: [''],
    });

    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      prixvente: [''],
      livrable: [false, Validators.required],
      statut: ['', Validators.required],
      quantiter: [0, Validators.required],
      categorie: [null, Validators.required], 
      enchers_id: [''],
    });
  }

  editArticleFunc(article: Article) {
    this.editMode = true;
    this.editArticle = article;
    this.editForm.patchValue({
      titre: article.titre,
      description: article.description,
      photo: article.photo,
      prix: article.prix,
      livrable: article.livrable,
      statut: article.statut,
      quantiter: article.quantiter,
      categorie: article.categorie ? article.categorie.id : null,
      enchere_id:article.enchere_id,
    });
    this.photoUrl = article.photo;
  }

  cancelEdit() {
    this.editMode = false;
    this.editArticle = null;
    this.editForm.reset();
    this.photoUrl = '';
  }
  
  deleteArticle(id: string) {
    this.articleService.deleteArticle(id).subscribe(
      response => {
        if (typeof response === 'string') {
          this.snackBar.open('Article supprimé avec succès!', 'Fermer', {
            duration: 3000
          });
          this.refreshAllArticles();
        }
      },
      (error: HttpErrorResponse) => {
        console.error("Erreur lors de la suppression de l'article:", error.error);
        window.location.reload();
        this.snackBar.open('Erreur lors de la suppression de l\'article: ' + error.error, 'Fermer', {
          duration: 3000,
        });
      }
    );
  }
  refreshAllArticles(){
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
  cancelCreation() {
    this.onCreatee = false;
    this.myForm.reset();
    this.photoUrl = '';
  }

  onSubmit() {
    if (this.editMode) {
      this.updateArticle(this.editArticle!);
    } else {
      this.createArticle();
    }
  }

  updateArticle(updatedArticle: Article) {
    if (this.editForm && this.editForm.valid && this.editArticle) {
      const updatedArticleData: Article = {
        id: this.editArticle.id,
        titre: this.editForm.value.titre,
        description: this.editForm.value.description,
        photo: this.editForm.value.photo,
        prix: this.editForm.value.prix,
        livrable: this.editForm.value.livrable,
        statut: this.editForm.value.statut,
        quantiter: this.editForm.value.quantiter,
        enchere_id:this.editForm.value.enchere_id,
        categorie: {
          id: this.editForm.value.categorie,
          titre: '', 
          description: '',
          image: ''
        },
      };
      this.articleService.updateArticle(this.editArticle.id.toString(), updatedArticleData).subscribe(
        Response => {
          this.editMode = false;
          this.editArticle = null;
          this.editForm.reset();
          this.photoUrl = '';
          this.getAllArticles();
          this.snackBar.open('Article mis à jour avec succès!', 'Fermer', {
            duration: 3000
          });
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la mise à jour de l\'article:', error);
          this.snackBar.open('Erreur lors de la mise à jour de l\'article: ' + error.message, 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }
  
  createArticle() {
    this.onCreatee = true;
    if (this.myForm.valid) {
      const newArticle: Article = {
        id: 0, // Assurez-vous que cela correspond à la logique d'attribution d'identifiants dans votre application
        titre: this.myForm.value.titre,
        description: this.myForm.value.description,
        photo: this.myForm.value.photo,
        prix: this.myForm.value.prix,
        livrable: this.myForm.value.livrable,
        statut: this.myForm.value.statut,
        quantiter: this.myForm.value.quantiter,
        enchere_id:this.myForm.value.enchere_id,
        categorie: {
          id: this.myForm.value.categorie,
          titre: '', // Provide empty values for now, they will be overwritten if needed
          description: '',
          image: ''
        },
      };
      this.articleService.addArticle(newArticle).subscribe(
        response => {
          this.onCreatee = false;
          this.myForm.reset(); // Clear form data
          this.photoUrl = ''; // Clear image preview
          this.getAllArticles();
          this.snackBar.open('Article créé avec succès!', 'Fermer', {
            duration: 3000
          });
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la création de l\'article:', error);
          this.snackBar.open('Erreur lors de la création de l\'article: ' + error.message, 'Fermer', {
            duration: 3000
          });
        }
      );
    }
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
}
