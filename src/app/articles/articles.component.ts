import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../article.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { AuthService } from '../_service/auth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { EnchersServiceService } from '../enchers-service.service';
import { PartEnService } from '../part-en.service';
import {  MatDialog } from '@angular/material/dialog';
import { SignalementComponent } from '../signalement/signalement.component';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../interfaces/user';
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
  categorie: Categorie;
}
interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  partens: Part_En[];
  admin: { id: number };
  articles: { id: number }[];
  etat:String;
}

export interface Part_En {
  id: number;
  encheres: Enchere;
  user: User;
  prixproposer: number;
  etat: String;
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
export class ArticlesComponent implements OnInit {
  displayedColumns = ['titre', 'description', 'photo', 'prix', 'Livrable', 'status', 'quantite', 'actions'];
  public editMode: boolean = false;
  userId!: number | null;
  enchere:any;
  public encheres: Enchere[] = []; // Utiliser le bon type Enchere[]
  articles$: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>([]);
  isLoading = true;
  selectedartIndex: number = -1;
  editingArticle: Article | null = null;
  userId$: Observable<number | null> = this.getUserIdObservable();
  public articles: Article[] = [];
  public editArticle: Article | null = null;
  editForm!: FormGroup;
  public vendeurId: number = 0; // Utilisation de 'public' pour déclarer une variable membre
  public loading: boolean = false;
  public photoUrl: string = '';
  public myForm!: FormGroup;
  selectedArticle: Article | null = null;
  vendeur: { id: number } = { id: 0 };
  urlPattern = new RegExp('^(https?:\\/\\/)?' + // Protocole
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Nom de domaine
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // Ou une adresse IP (v4) 
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port et chemin
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // Paramètres de requête
    '(\\#[-a-z\\d_]*)?$', 'i'); // Fragment
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
    vendeur: { id: 0 },
    categorie: { id: 0, titre: '', description: '', image: '' }
  };
  isModificationActive: boolean = false;
  userType: string | string[] | null;
  categories: Categorie[] = [];
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  showEditForm: boolean = false;
  panierDetails: any[] = [];
  constructor(public dialog: MatDialog,
    private formBuilder: FormBuilder, public authService: AuthService,
    private articleService: ArticleService, public router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    //private  panierService :PanierService,
    private encherService :  EnchersServiceService,
   private  partEnService : PartEnService,private location: Location,private cookieService: CookieService,
  ) {
    this.userType = this.authService.getUserType();
    this.myForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
     
      livrable: [false],
      statut: [''],
      quantiter: [0],
      categorie: [0],
      vendeur: [0]
    });

    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
     
      livrable: [false],
      statut: [''],
      quantiter: [0],
      categorie: [0],
      vendeur: [0]
    });

    this.checkToken();
  }
  goBack(): void {
    this.location.back();
  }
 
  ngOnInit() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        this.encherService.findUserIdByNom(username).subscribe(
          userId => {
            console.log('ID de l\'utilisateur trouvé :', userId);
            // Maintenant, vous avez l'ID de l'utilisateur, vous pouvez récupérer le partenaire ID
            this.partEnService.getPartenIdByUserId(userId).subscribe(
              partenId => {
                console.log('ID du partenaire trouvé :', partenId);
                // Faites ce que vous devez faire avec l'ID du partenaire ici
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
    // Appel de votre méthode pour récupérer le gagnant de l'enchère

    //this.addToCart(this.articles);
   // this.getPanierDetails;
    this.initForm();
    this.getAllArticles();
    this.getAllCategories();
    this.showEditForm = false;
    this.getUserIdObservable().subscribe(userId => {
      if (userId !== null) {
        this.userId = userId;
        this.newArticle.vendeur = { id: userId }; // Assurez-vous de mettre à jour vendeur lorsque userId est défini
      }
    });
    this.userId$ = this.getUserIdObservable();
  
  }
  topPrixProposerParten: { [key: number]: Part_En } = {};
  /*getTopPrixProposerParten(userId: number, enchereId: number) {
    this.encherService.participateInEnchere(userId, enchereId).subscribe(
      () => {
        this.cookieService.set('userId', userId.toString());
        const userIdd = parseInt(this.cookieService.get('userId') || '0');
        console.log("ID de l'utilisateur userIdd:", userIdd);
        this.partEnService.getTopPrixProposerParten(enchereId)
          .subscribe(
            (partEn: Part_En) => {
              console.log('Part_En:', partEn);
              // Maintenant, partEn contient les détails de la Part_En, y compris les détails du gagnant
              if (partEn.user) {
                console.log('Gagnant:', partEn.user);
                // Utilisez les détails du gagnant comme vous le souhaitez
              } else {
                console.log('Aucun gagnant trouvé.');
              }
            },
            (error) => {
              console.error('Erreur lors de la récupération de la Part_En:', error);
            }
          );
      }
    );
  }*/
  getAllCategories() {
    this.articleService.getAllCategories().subscribe(
      (categories: Categorie[]) => {
        this.categories = categories;
      },
      (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        // Gérer l'erreur comme nécessaire
      }
    );
  }
  toggleOptions(index: number): void {
    this.selectedartIndex = (this.selectedartIndex === index) ? -1 : index;
    console.log("Options affichées pour l'article à l'index", index, ":", this.selectedartIndex === index);
  }
  ouvrirsignalement(article:Article): void {
    this.dialog.open(SignalementComponent, {
      width: '400px',
      data: { article: article }
    });

  }
  

  initForm() {
    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      livrable: [false],
      statut: [''],
      quantiter: [0],
      categorie: [0],
    });
  }
  showArticleDetails(article: Article) {
    // Naviguer vers la page de détail de l'article avec son ID comme paramètre
    this.router.navigate(['/detail-article/', article.id]);
  }

  closeArticleDetails() {
    this.selectedArticle = null;
  }
 /* getPanierDetails(partenId: number) {
    this.panierService.getPanierAvecIdPartenaire(partenId).subscribe(
      (panier: any[]) => {
        console.log("Panier reçu du backend :", panier); // Ajout d'un message de débogage pour afficher le panier reçu
  
        if (panier && panier.length > 0) {
          this.panierDetails = panier;
        } else {
          console.error("Le panier est indéfini ou vide.");
        }
  
        // Vérifier également si les articles sont définis
        if (panier && panier.length > 0 && panier[0].parten && panier[0].parten.panier) {
          console.log("Articles du panier reçus du backend :", panier[0].parten.panier); // Ajout d'un message de débogage pour afficher les articles du panier
        } else {
          console.error("Les articles du panier sont indéfinis.");
        }
      },
      (error: any) => {
        console.error("Erreur lors de la récupération du panier :", error);
      }
    );
  }*/
  
errorMessage: string = '';
nombreArticlesDansPanier: number = 0;
/*addToCart(article: any) {
  // Récupérer l'ID de l'utilisateur
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
          const username = tokenPayload.sub;
          // Trouver l'ID de l'utilisateur par son nom d'utilisateur
          this.encherService.findUserIdByNom(username).subscribe(
              userId => {
                  console.log('ID utilisateur trouvé :', userId);
                  // Une fois que vous avez l'ID de l'utilisateur, récupérez l'ID du partenaire
                  this.partEnService.getPartenIdByUserId(userId).subscribe(
                      partnerId => {
                          console.log('ID partenaire trouvé :', partnerId);
                          // Appelez votre service pour obtenir les paniers associés au partenaire
                          this.panierService.getPaniersByPartenaire(partnerId).subscribe(
                              (carts: any[]) => {
                                  // Vérifiez si les paniers existent
                                  if (carts && carts.length > 0) {
                                      // Sélectionnez le premier panier du tableau
                                      const cart = carts[0];
                                      console.log("Quantité de l'article :", article.quantite);
                                      
                                      // Vérifiez si la quantité dans le panier ne dépasse pas la quantité disponible
                                      this.panierService.containsArticle(cart.id, article.id).subscribe(
                                        (articleExists: boolean) => {
                                          if (articleExists) {
                                            console.log("L'article existe dans le panier.");

                                            // Mettez à jour le panier avec la quantité et le prix de l'article
                                            cart.quantitecde++;
                                            cart.totalP = article.prixvente + cart.totalP;

                                            // Appelez votre service pour mettre à jour le panier
                                            this.panierService.updatePanier(cart.id, cart).subscribe(
                                                (response) => {
                                                    console.log("Panier mis à jour avec succès :", response);
                                                    this.snackBar.open('Panier mis à jour avec succès ', 'Fermer', {
                                                      duration: 3000
                                                    });
                                                    this.getPanierDetails;
                                                    this.nombreArticlesDansPanier++;
                                                },
                                                (error) => {
                                                    console.error("Erreur lors de la mise à jour du panier :", error);
                                                }
                                            );
                                          } else {
                                            console.log("L'article n'existe pas dans le panier. Création d'un nouveau panier.",partnerId,cart.id,article);
                                            cart.quantitecde++;
                                            cart.totalP = article.prixvente  + cart.totalP;
                                            console.log("existingCart.id",cart.id);
                                            // Appeler le service pour ajouter l'article au panier
                                            this.panierService.addToCart(article.id, cart.id, partnerId).subscribe(
                                              (response) => {
                                                console.log("Article ajouté au panier avec succès:", response);
                                                this.snackBar.open('Article ajouté au panier avec succès ', 'Fermer', {
                                                  duration: 3000
                                                });
                                                this.getPanierDetails;
                                                this.nombreArticlesDansPanier++;
                                              },
                                              (error) => {
                                                console.error("Erreur lors de l'ajout de l'article au panier:", error);
                                              }
                                            );
              
                                          }
                                        },
                                        (error) => {
                                          //console.error("Erreur lors de la vérification de l'article dans le panier :", error);
                                        }
                                      );
                                  } else {
                                      // Créez un nouveau panier pour le partenaire et ajoutez l'article
                                      console.log("L'article n'existe pas dans le panier. Création d'un nouveau panier.",partnerId,article);
                                      this.createCart(partnerId, article);
                                  }
                              },
                              (error) => {
                                  console.error("Erreur lors de la récupération des paniers :", error);
                              }
                          );
                      },
                      error => {
                          console.error('Erreur lors de la récupération de l\'ID partenaire:', error);
                      }
                  );
              },
              error => {
                  console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
              }
          );
      }
  }
}


createCart(partnerId: any, article: any) {
  // Créer un nouveau panier pour le partenaire
  this.panierService.addPanier(partnerId).subscribe(
      (newCartId: number) => {
          console.log("Nouveau panier créé avec l'ID :", newCartId);

          // Récupérer le nouveau panier créé depuis le serveur
          this.panierService.getPanierById(newCartId).subscribe(
              (newCart: any) => {
                  console.log("Détails du nouveau panier :", newCart);
                  //  if (newCart.quantitecde < article.quantiter) {
                  newCart.quantitecde++ || 0;
                  // Définir la quantité initiale à 1 et calculer le prix total
                  newCart.quantitecde++;
                  newCart.totalP = article.prixvente + newCart.totalP;

                  // Ajouter l'article au nouveau panier
                  this.panierService.addToCart(article.id, newCartId, partnerId).subscribe(
                      (response) => {
                          console.log("Article ajouté au panier avec succès :", response);
                       
                          this.snackBar.open('Article ajouté au panier avec succès ', 'Fermer', {
                            duration: 3000
                          });
                          this.getPanierDetails;
                      },
                      (error) => {
                          console.error("Erreur lors de l'ajout de l'article au panier :", error);
                      }
                      
                  );
              },
              (error) => {
                  console.error("Erreur lors de la récupération des détails du nouveau panier :", error);
              }
          );
      },
      (error) => {
          console.error("Erreur lors de la création du nouveau panier :", error);
      }
  );
}*/


  getAllArticles() {
    this.articleService.getAllArticles().subscribe(
      (articles: Article[]) => {
        this.articles = articles;
        // Une fois que vous avez récupéré les articles, vous pouvez appeler getCategoryForArticle pour chaque article
        this.articles.forEach(article => {
          this.getCategoryForArticle(article);
        });
      },
      (error) => {
        console.error('Erreur lors du chargement des articles:', error);
        // Gérer l'erreur comme nécessaire
      }
    );
  }
  getCategoryForArticle(article: Article) {
    this.articleService.getCategoryById(article.categorie.id.toString()).subscribe(
      (categorie: Categorie) => {
        // Mettre à jour les informations sur la catégorie de l'article
        article.categorie = categorie;
      },
      (error) => {
        console.error('Erreur lors de la récupération de la catégorie pour l\'article:', error);
        // Gérer l'erreur comme nécessaire
      }
    );
  }
  saveEdit() {
    if (this.editForm.valid && this.editingArticle) {
      const updatedArticle: Article = {
        ...this.editingArticle,
        ...this.editForm.value
      };
      this.articleService.updateArticle(updatedArticle.id.toString(), updatedArticle).subscribe(
        response => {
          this.snackBar.open('Article mis à jour avec succès!', 'Fermer', {
            duration: 3000
          });
          this.getAllArticles();
          this.getAllCategories();
          this.cancelEdit();
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la mise à jour de l\'article:', error);
          this.snackBar.open('Erreur lors de la mise à jour de l\'article  ' + error.message, 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }
  disableModificationFeature() {
    this.isModificationActive = false;
  }
  showEditArticleForm(article: Article) {
    this.fillEditForm(article);
    this.showEditForm = true;
  }
  fillEditForm(article: Article) {
    this.editForm.patchValue({
      titre: article.titre,
      photo: article.photo,
      quantiter: article.quantiter,
      prix: article.prix,
      statut: article.statut,
      livrable: article.livrable,
      description: article.description
    });
  }
  // Ajoutez une méthode pour masquer le formulaire de modification
  hideEditArticleForm() {
    this.showEditForm = false;
  }
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  isUserTheSeller(article: Article): boolean {
    if (this.authService.isLoggedIn() && this.userType === 'vendeur') {
      console.log("vvvvv",article.vendeur?.id)
      return article.vendeur && article.vendeur.id === this.userId;
    }
    return false;
  }
  
  getUserIdObservable(): Observable<number | null> {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        if (tokenPayload.sub) {
            const username = tokenPayload.sub;
            return this.articleService.findUserIdByNom(username).pipe(
                map(userId => userId ? userId : null)
            );
        }
    }
    return of(null);
}
editArticleFunc(article: Article) {
  this.isModificationActive = true;
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
      categorie: article.categorie,
      vendeur:article.vendeur
  });
  // Assurez-vous que userId est défini avant de l'utiliser dans la condition
  if (this.userId !== null) {
      // Mettez à jour vendeur avec l'ID de l'utilisateur actuellement connecté
      this.editArticle.vendeur = { id: this.userId };
  }
}
 cancelEdit() {
    this.editMode = false;
    this.editArticle = null; 
    this.editForm.reset(); 
    this.photoUrl = ''; 
    this.showEditForm = false;
    this.isModificationActive = false;
}
deleteArticle(id: string) {
  if (confirm('Voulez-vous vraiment supprimer cet article?')) {
    this.articleService.deleteArticle(id).subscribe(
      () => {
        // Filtrer la liste des articles pour exclure l'article supprimé
        const updatedArticles = this.articles$.value.filter(article => article.id !== +id);
        
        // Mettre à jour la liste locale d'articles avec la nouvelle liste filtrée
        this.articles$.next(updatedArticles);
        
        this.snackBar.open('Article supprimé avec succès!', 'Fermer', {
          duration: 3000
         
        });
        window.location.reload();
        this.getAllArticles();
      },
      (error: HttpErrorResponse) => {
        this.snackBar.open('Erreur lors de la suppression de l\'article: ' + error.message, 'Fermer', {
          duration: 3000
        });
      }
    );
  }
}

  articless: Article[] = []; 
  refresharticles(): void {
    this.articleService.getAllArticles().subscribe(
      articless => {
        this.articless = articless;
        // Fermer la fenêtre après la mise à jour des commentaires
        
      },
      error => {
        console.error("Erreur lors de la récupération des commentaires :", error);
      }
    );
  }
  
  cancelCreation() {
    this.onCreatee = false;
    this.myForm.reset(); // Réinitialise le formulaire
    this.photoUrl = '';
  }
  onSubmit() {
    if (this.editMode) {
      console.log("avant onSubmit - editMode", this.editMode);
      if (this.editForm && this.editForm.valid && this.editArticle) {
        console.log("apres onSubmit - editMode", this.editArticle);
       this.updateArticle(this.editArticle);
        this.isModificationActive = false;
      }
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
        categorie: {
          id: this.editForm.value.categorie,
          titre: '', 
          description: '',
          image: ''
        },
        vendeur: { id: this.editArticle.vendeur.id } // Ajoutez le vendeur à l'article mis à jour
      };
      this.articleService.updateArticle(updatedArticleData.id.toString(), updatedArticleData).subscribe(
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
   private checkToken() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
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
        if (!token) this.router.navigate(['/']);
      },
    });
  }
  

 
  createArticle() {
    this.onCreatee = true;
    if (this.myForm.valid) {
      const newArticle: Article = {
        titre: this.myForm.value.titre,
        description: this.myForm.value.description,
        photo: this.myForm.value.photo,
        prix: this.myForm.value.prix,
        livrable: this.myForm.value.livrable,
        statut: this.myForm.value.statut,
        quantiter: this.myForm.value.quantiter,
        id: 0 ,
        vendeur:this.editForm.value.vendeur,
        categorie:this.editForm.value.categorie,
      };
      console.log('Envoi des données au backend.');

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
          this.snackBar.open('Erreur lors de la création de l\'article ' + error.message, 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }
  handleCardClick(event: any, article: any) {
    if (event && event.target && event.target.tagName.toLowerCase() === 'button' && event.target.textContent.trim() === 'Add To cart') {
      // Ne rien faire si le clic provient du bouton "Add To cart"
      return;
    }
    
    // Si le clic ne provient pas du bouton "Add To cart", exécuter la fonction showArticleDetails(article)
    this.showArticleDetails(article);
  }
  
  
  isValidURL(url: string): boolean {
    // Expression régulière pour valider les URL
    const urlPattern = new RegExp('^(https?:\\/\\/)?([a-z0-9-]+\\.)+[a-z]{2,}([\\/\\?#].*)?$', 'i');
    return urlPattern.test(url);
  }


}