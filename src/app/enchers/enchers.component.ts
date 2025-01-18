import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnchersServiceService } from '../enchers-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '../article.service';
import {  BehaviorSubject, Observable, Subject,catchError,map,of } from 'rxjs';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { AuthService  } from '../_service/auth.service';
import { PartEnService } from '../part-en.service';
import { CookieService } from 'ngx-cookie-service';
//import { PanierService } from '../shopping-cart/cards/panier.service';
import Swal from 'sweetalert2';

export interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  parten: Part_En[];
  admin: { id: number };
  articles: { id: number }[];
  etat:string;
}
export interface Part_En {
  id: number;
  encheres: Enchere;
  user: User;
  prixproposer: number;
  etat: string;
}
interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
 // livrable: boolean;
  statut: string; 
  showPriceForm?: boolean;
 // quantiter: number;

}
let enchereData: Enchere[] = [];
@Component({
  selector: 'app-enchers',
  templateUrl: './enchers.component.html',
  styleUrls: ['./enchers.component.css']
})
export class EnchersuserComponent implements OnInit {
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  currentUser: User | null = null;

  article: any;
  userData = new BehaviorSubject<User | null>(null);
  userDataObs$ = this.userData.asObservable();
  selectedEnchereId: number | undefined;
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment

  currentUserr: string | undefined;
 

// Déclaration de la fonction dans la classe de composant
parseDate(dateString: string): number | undefined {
  return parseInt(dateString, 10); // Convertit la chaîne en nombre entier
} // Déclarer le formulaire

  public myForm!: FormGroup;
  //encheres: any[] = [];

  public encheres: Enchere[] = []; // Utiliser le bon type Enchere[]
  public loading: boolean = false;
  public articles: Article[] = [];
  public editMode: boolean = false;
  userParticipation: { [key: number]: boolean } = {};
  public editForm!: FormGroup;
  public partens: Part_En[] = [];
  public admins: any[] = [];
  public prixproposerForm!: FormGroup;
  public selectedArticleId: number | undefined;
  public showAddPriceForm: boolean = false;
  articlesForEnchereMap: { [key: number]: Article[] } = {};
  public showAddForm: boolean = false; 
  public formattedDateDebut!: string;
  public formattedDateFin!: string;
  private unsubscribe$ = new Subject<void>();
  public articlesForEnchere: Article[] = [];
  //public articlesForEnchereMap: { [enchereId: number]: Article[] } = {};
 private isLoggedInSubject = new BehaviorSubject<boolean>(false);
 authStatus = this.isLoggedInSubject.asObservable();
  constructor(private cookieService: CookieService,
    private formBuilder: FormBuilder,
    private encherService: EnchersServiceService,
    private snackBar: MatSnackBar,  public router: Router,private authService: AuthService  ,
   private articleService: ArticleService,private partenservice:PartEnService,  //private  panierService :PanierService,
  ) {
    this.myForm = this.createEnchereForm();
    this.editForm = this.createEnchereForm();
    this.myForm = this.formBuilder.group({
      id: [0],
      dateFin: [new Date()],
      dateDebut: [new Date()],
      partens:  this.formBuilder.control([]) ,
      admin: ['', Validators.required], 
      etat: ['', Validators.required], 
      articles: this.formBuilder.control([]) 
    });
    this.prixproposerForm = this.formBuilder.group({
      prixproposer: ['', Validators.required] 
    });
    this.editForm = this.formBuilder.group({
      id: [0],
      dateFin: [new Date()],
      dateDebut: [new Date()],
      partens: this.formBuilder.control([]) ,
      etat: ['', Validators.required], 
      admin: ['', Validators.required], 
      articles: this.formBuilder.control([]) 
    });    
    this.formattedDateDebut = this.formatDate(this.myForm.value.dateDebut);
    this.formattedDateFin = this.formatDate(this.myForm.value.dateFin);
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
    this.tokenObs$.subscribe(token => {
      if (!token) this.router.navigate(['/']);
    });
    this.prixproposerForm = this.formBuilder.group({
      prixproposer: [null, Validators.required] // Initialisez avec null ou une valeur par défaut
    });
}
getTopPrixProposerParten(userId: number, enchereId: number) {
  if (userId && enchereId) {
    this.encherService.participateInEnchere(userId, enchereId).subscribe(
      () => {
        this.partenservice.getTopPrixProposerParten(enchereId)
          .subscribe(
            (partEn: Part_En) => {
              console.log('Part_En:', partEn.id);
              if (partEn.user) {
                console.log('Gagnant:', partEn.user.nom, partEn.user.prenom);
                // mettez à jour une variable pour l'afficher dans le template
                this.currentUser = partEn.user;
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
  }
}

getArticleById(articleId: number): void {
  this.articleService.getArticleById(articleId).subscribe(
    (article: Article) => {
      this.article = article;
      console.log('Article:', this.article);
    },
    error => {
      console.error('Error fetching article:', error);
    }
  );
}
createEnchereForm(): FormGroup {
  return this.formBuilder.group({
    id: [0],
    dateFin: [new Date()],
    dateDebut: [new Date()],
    parten:  this.formBuilder.control([]),
    admin: ['', Validators.required],
    etat: ['', Validators.required], 
    articles: this.formBuilder.control([])
  });
}

public getArticlesForEnchere(enchereId: number): Observable<Article[]> {
  if (this.articlesForEnchereMap[enchereId]) {
    // Si les articles pour cette enchère ont déjà été récupérés, les retourner immédiatement
    return of(this.articlesForEnchereMap[enchereId]);
  } else {
    // Sinon, récupérer les articles depuis le service et les stocker dans le dictionnaire
    return this.encherService.getArticlesForEnchere(enchereId).pipe(
      map((articles: Article[]) => {
        this.articlesForEnchereMap[enchereId] = articles;
        return articles;
      }),
      catchError((error) => {
        console.error('Une erreur s\'est produite lors de la récupération des articles de l\'enchère avec ID', enchereId, ':', error);
        // Retourner un tableau vide en cas d'erreur
        return of([]);
      })
    );
  }}




getArticlePhoto(articleId: number): string {
  const article = this.articles.find(article => article.id === articleId);
  return article ? article.photo : ''; // Retourne l'URL de la photo de l'article ou une chaîne vide si l'article n'est pas trouvé
}

findUserIdAndParticipateEnchere(enchereId: number) {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    console.log("storedTokennnn",storedToken);
    const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
    console.log(tokenPayload);
    if (tokenPayload.sub) {
      const username = tokenPayload.sub;
      console.log('Nom utilisateur :', username);
      // Utilisation directe de tokenPayload.sub pour récupérer le nom d'utilisateur
      this.encherService.findUserIdByNom(username).subscribe(
        userId => {
          console.log('ID de l\'utilisateur trouvéeee :', userId);
        
          // Call participerEnchere with userId
          this.participerEnchere(userId, enchereId);
        },
        error => {
          console.error('Erreur lors de la recherche de l\'ID de l\'utilisateur :', error);
        }
      );
    } else {
      console.error('Nom utilisateur non trouvé dans le payload du token');
    }
  } else {
    console.error('Token non trouvé dans le stockage local');
  }
}

participerEnchere(userId: number, enchereId: number) {
  this.encherService.participateInEnchere(userId, enchereId).subscribe(
    () => {
      this.cookieService.set('userId', userId.toString());
      const userIdd = parseInt(this.cookieService.get('userId') || '0');
      console.log("ID de l'utilisateur userIdd:", userIdd);
       // Mettez à jour les données après la participation à l'enchère
      // this.userParticipation[enchereId] = true;
      this.getAllEncheres(); 
      this.loadEncheres();
      // Met à jour la liste des enchères après la participation
      this.snackBar.open('Vous avez participé à l\'enchère avec succès!', 'Fermer', {
        duration: 3000
      });

    },
    (error: HttpErrorResponse) => {
      if (error.status !== 200) {
        console.error('Vous avez participé à l\'enchère avec succès');
        // Affichez un message d'erreur à l'utilisateur uniquement si le statut de la réponse est différent de 200
        this.snackBar.open('Vous avez participé à l\'enchère avec succès', 'Fermer', {
          duration: 3000
        });

      }else{
        this.snackBar.open('Vous avez participé à l\'enchère avec succès!', 'Fermer', {
          duration: 3000
        });
      }
    }
  );
}

public userid: number =0;

  ngOnInit() {
    this.loadCartState(); 
    this.getAllEncheres();
    this.getAllArticles();
    this.getAllPartens();
    this.getAllAdmins();
    this.getAllArticles();
    this.encheres.forEach(enchere => {
      // Vérifie si l'ID de l'enchère est défini avant d'appeler la méthode
      if (enchere.id !== undefined) {
        // Appel de la méthode pour récupérer les articles pour chaque enchère
       this.getArticlesForEnchere(enchere.id);
      }
    });
   
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log("storedTokennnn",storedToken);
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      console.log(tokenPayload);
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        console.log('Nom utilisateur :', username);
        // Utilisation directe de tokenPayload.sub pour récupérer le nom d'utilisateur
        this.encherService.findUserIdByNom(username).subscribe(
          userId => {
            console.log('ID de l\'utilisateur trouvéeee :', userId);
          this.userid=userId;
          console.log('ID de l\'utilisaaaaaaa :', this.userid);
          this.encheres.forEach(enchere => {
            // Vérifie si l'ID de l'enchère est défini avant d'appeler la méthode
            if (enchere.id !== undefined) {
              // Appel de la méthode pour récupérer les articles pour chaque enchère
            // this.getTopPrixProposerParten(this.userid,enchere.id,);
            
            }
          });
          },
          error => {
            console.error('Erreur lors de la recherche de l\'ID de l\'utilisateur :', error);
          }
        );
      } else {
        console.error('Nom utilisateur non trouvé dans le payload du token');
      }
    } else {
      console.error('Token non trouvé dans le stockage local');
    }
    this.loadEncheres();
  }
  users: User[] = [];
  topPrixProposerParten: { [key: number]: Part_En } = {};
  loadEncheres(): void {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        this.encherService.findUserIdByNom(username).subscribe(
          userId => {
            this.userid = userId;
            this.encheres.forEach(enchere => {
              const enchereId = enchere.id; // Stockez enchere.id dans une variable locale
              if (enchereId !== undefined) { // Vérifiez si enchereId est défini
                this.partenservice.getTopPrixProposerParten(enchereId).subscribe((data: Part_En) => {
                  if (data !== undefined) { // Vérifiez si data est défini
                    if (typeof enchereId === 'number') { // Assurez-vous que enchereId est bien un nombre
                      this.topPrixProposerParten[enchereId] = data;
                      console.log('datadata', data);
                      console.log('partenid', data.id);
  
                      this.partenservice.getUsersByPartenId(data.id).subscribe(
                        (users: User[]) => {
                          console.log('Utilisateurs:', users);
                          this.users = users;
                          // Appelez getUserIdForTopProposedPrice uniquement si enchereId est défini
                          if (enchereId !== undefined) {
                            this.getUserIdForTopProposedPrice(enchereId).subscribe(
                              userId => {
                                console.log('ID de l\'utilisateur gagnant:', userId);
                                this.partenservice.getUserDetails(userId).subscribe(
                                  user => {
                                    console.log('Détails de l\'utilisateur gagnantttt:', user);
                                    // Faites quelque chose avec les détails de l'utilisateur gagnant, par exemple, les afficher dans votre composant
                                  },
                                  error => {
                                    console.error('Erreur lors de la récupération des détails de l\'utilisateur gagnant :', error);
                                  }
                                );
                              },
                              error => {
                                console.error('Erreur lors de la récupération de l\'ID de l\'utilisateur gagnant :', error);
                              }
                            );
                          }
                        },
                        (error) => {
                          console.error('Erreur lors de la récupération des utilisateurs associés au partenaire:', error);
                        }
                      );
  
                    }
                  }
                });
              }
            });
          },
          error => {
            console.error('Erreur lors de la recherche de l\'ID de l\'utilisateur :', error);
          }
        );
      } else {
        console.error('Nom utilisateur non trouvé dans le payload du token');
      }
    } else {
      console.error('Token non trouvé dans le stockage local');
    }
  }
 public obtenirPartenId(userId: number, enchereId: number): Observable<number | null> {
    if (!userId || !enchereId) {
      return of(null); // ou une autre logique appropriée pour gérer les valeurs non définies
    }
    return this.partenservice.getPartenIdByUserIdd(userId, enchereId);
  }
  isNumber(value: any): boolean {
    return typeof value === 'number';
  }
  
public userIdd: number | undefined; 
public userss: User [] = [];
public enchereId: number | undefined; 
  getUserIdForTopProposedPrice(enchereId: number): Observable<number> {
    return new Observable(observer => {
      console.log("Début de la récupération de l'ID de l'utilisateur gagnant pour l'enchère ID :", enchereId);
      this.partenservice.getTopPrixProposerParten(enchereId).subscribe((data: Part_En) => {
        console.log("Données récupérées pour l'enchère ID :", enchereId, ":", data);
        if (data !== undefined) { // Vérifier si data est défini
          console.log("Données trouvées pour l'enchère ID :", enchereId);
          // Utiliser une vérification de type pour assurer que enchereId est bien un nombre
          if (typeof enchereId === 'number') {
            console.log("Récupération des utilisateurs associés à l'enchère ID :", enchereId);
            this.partenservice.getUsersByPartenId(data.id)
              .subscribe(
                (users: User[]) => {
                  console.log("Utilisateurs associés à l'en :", enchereId, ":", users);
                  this.userss=users;
                  this.enchereId=enchereId;
                  console.log("Utilisateuen :", this.userss);
                },
                (error) => {
                  console.error("Erreur lors de la récupération des utilisateurs associés à l'enchère ID :", enchereId, ":", error);
                  observer.error(error);
                }
              );
          } else {
            console.error("L'enchère ID n'est pas un nombre valide :", enchereId);
            observer.error("L'enchère ID n'est pas un nombre valide.");
          }
        } else {
          console.error("Aucune donnée récupérée pour l'enchère ID :", enchereId);
        }
      });
    });
  }

  findUserIdAndParticipateEncheree(enchereId: number): void {
    this.getUserIdForTopProposedPrice(enchereId).subscribe(
      (userId: number) => {
        console.log('User ID found:', userId);
        // Implémentez votre logique de participation ici
      },
      (error: any) => {
        console.error('Error fetching user ID:', error);
      }
    );
  }
  
  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return ''; // Si le timestamp est indéfini, retourne une chaîne vide
    const date = new Date(timestamp); // Crée une nouvelle instance de Date à partir du timestamp
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}  ${hours}:${minutes}`;
}

isLoggedIn(): boolean {
  return !!this.token.value;
}
getAllEncheres() {
  this.loading = true;
  this.encherService.getAllEncheres().subscribe(
    (encheres: Enchere[]) => {
      this.encheres = encheres;
      console.log("liste des encheres", this.encheres);

      // Affichage de chaque enchère dans la console


      this.loading = false; 
    },
    (error: HttpErrorResponse) => {
      console.error('Error fetching encheres:', error);
      this.loading = false;
      this.snackBar.open('Error loading encheres!', 'Close', {
        duration: 3000
      });
    }
  );
}


closeForm() {
  // Set showAddPriceForm to false to hide the form
  this.showAddPriceForm = false;
}

getAllArticles() {
  this.articleService.getAllArticles().subscribe(
    (articles: Article[]) => {
      this.articles = articles;
    },
    (error: HttpErrorResponse) => {
      console.error('Erreur lors de la récupération des articles :', error);
    }
  );
}

  getAllPartens() {
    this.encherService.getAllPartens().subscribe(
      (partens: any[]) => {
        this.partens = partens;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching partens:', error);
        // Gérer les erreurs si nécessaire
      }
    );
  }

  getAllAdmins() {
    this.encherService.getAllAdmins().subscribe(
      (admins: any[]) => {
        this.admins = admins;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching admins:', error);
      }
    );
  }

  getArticleTitle(articleId: number): string {
    const article = this.articles.find(article => article.id === articleId);
    return article ? article.description : ''; // Retourne la description de l'article ou une chaîne vide si l'article n'est pas trouvé
  }
  onCreate() {
    this.showAddForm = true;
    if (this.myForm.valid) {
    //  const selectedUser = this.partens.find(partens => partens.users === this.myForm.value.parten); // Trouver l'utilisateur correspondant au nom sélectionné
      const selectedAdmin = this.admins.find(admin => admin.nom === this.myForm.value.admin); // Trouver l'administrateur correspondant au nom sélectionné

      if ( selectedAdmin) { // Vérifier si l'utilisateur et l'administrateur ont été trouvés
        const newEnchere: Enchere = {
          id: this.myForm.value.id,
          dateFin: this.formattedDateFin,
          dateDebut: this.formattedDateDebut,
          parten:this.myForm.value.partens,
          etat: this.myForm.value.etat,
           admin: { id: selectedAdmin.id },
          articles: this.myForm.value.articles.map((article: any) => ({ id: article.id }))
        };
        
    
        this.encherService.addEnchere(newEnchere).subscribe(
          (response: any) => {
            this.myForm.reset();
            this.encheres.push(response);
            this.snackBar.open('Enchère créée avec succès!', 'Fermer', {
              duration: 3000
            });
          },
          (error: HttpErrorResponse) => {
            console.error('Erreur lors de la création de l\'enchère :', error);
            this.snackBar.open('Erreur lors de la création de l\'enchère', 'Fermer', {
              duration: 3000
            });
          }
        );
      } else {
        console.error('Utilisateur ou administrateur non trouvé.');
        this.snackBar.open('Utilisateur ou administrateur non trouvé.', 'Fermer', {
          duration: 3000
        });
      }
    }
  }


  cancelCreation() {
    this.myForm.reset();
    this.showAddForm=false;
  }
  onSubmit() {
    if (this.editMode) {
      if (this.editForm.valid) {
        const updatedEnchere: Enchere = {
          id: this.editForm.value.id,
          etat: this.editForm.value.etat,
          dateFin: this.editForm.value.dateFin,
          dateDebut: this.editForm.value.dateDebut,
          parten: this.editForm.value.parten,
          admin: { id: this.editForm.value.admin },
          articles: this.editForm.value.articles.map((article: any) => ({ id: article }))
        };
        if (updatedEnchere.id !== undefined) {
          this.encherService.updateEnchere(updatedEnchere.id, updatedEnchere).subscribe(
            () => {
              const index = this.encheres.findIndex(enchere => enchere.id === updatedEnchere.id);
              if (index !== -1) {
                this.encheres[index] = updatedEnchere;
              }
              this.editForm.reset();
              this.editMode = false;
              this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
            },
            (error: HttpErrorResponse) => {
              console.error('Erreur lors de la mise à jour de l\'enchère :', error);
              this.snackBar.open('Erreur lors de la mise à jour de l\'enchère', 'Fermer', { duration: 3000 });
            }
          );
        } else {
          console.error('ID de l\'enchère non défini.');
        }
      }
    } else {
      // Si le mode édition n'est pas activé, créez une nouvelle enchère
      if (this.myForm.valid) {
        const newEnchere: Enchere = {
          id: this.myForm.value.id,
          etat: this.myForm.value.etat,
          dateFin: this.myForm.value.dateFin,
          dateDebut: this.myForm.value.dateDebut,
          parten: this.myForm.value.partens,
          admin: { id: this.myForm.value.admin },
          articles: this.myForm.value.articles.map((article: any) => ({ id: article.id }))
        };
  
        this.encherService.addEnchere(newEnchere).subscribe(
          (response: any) => {
            // Ajoutez la nouvelle enchère à la liste des enchères
            this.encheres.push(response);
            // Réinitialisez le formulaire
            this.myForm.reset();
            // Affichez un message de succès à l'utilisateur
            this.snackBar.open('Enchère créée avec succès!', 'Fermer', {
              duration: 3000
            });
          },
          (error: HttpErrorResponse) => {
            console.error('Erreur lors de la création de l\'enchère :', error);
            // Affichez un message d'erreur à l'utilisateur
            this.snackBar.open('Erreur lors de la création de l\'enchère', 'Fermer', {
              duration: 3000
            });
          }
        );
      }
    }
  }  
  editEnchere(enchere: Enchere) {
    this.editMode = true;
    this.editForm.patchValue({
      id: enchere.id,
      dateFin: enchere.dateFin,
      dateDebut: enchere.dateDebut,
      parten: enchere.parten ,// Utilisez l'ID de l'utilisateur au lieu de l'objet complet
      admin: enchere.admin.id, // Utilisez l'ID de l'administrateur au lieu de l'objet complet
      articles: enchere.articles ? enchere.articles.map(article => article) : [] // Vérifiez si enchere.articles est défini avant de mapper
    });
  }
  
  // Méthode pour afficher ou masquer le formulaire d'ajout du prix de vente
toggleAddPriceForm(articleId: number | undefined) {
    if (articleId !== undefined) {
        this.showAddPriceForm = true; // Afficher le formulaire de prix de vente
        this.selectedArticleId = articleId;
    }
}
  deleteEnchere(id: number) {
    // Appelez le service pour supprimer l'enchère
    this.encherService.deleteEnchere(id).subscribe(
      () => {
        // Supprimez l'enchère de la liste
        this.encheres = this.encheres.filter(enchere => enchere.id !== id);
        // Affichez un message de réussite à l'utilisateur
        this.snackBar.open('Enchère supprimée avec succès!', 'Fermer', {
          duration: 3000
        });
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression de l\'enchère :', error);
        // Affichez un message d'erreur à l'utilisateur
        this.snackBar.open('Erreur lors de la suppression de l\'enchère', 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  cancelEdit() {
    // Réinitialisez le formulaire d'édition
    this.editForm.reset();
    // Passez en mode non édition
    this.editMode = false;
  }
  isValidURL(url: string): boolean {
    // Expression régulière pour valider les URL
    const urlPattern = new RegExp('^(https?:\\/\\/)?([a-z0-9-]+\\.)+[a-z]{2,}([\\/\\?#].*)?$', 'i');
    return urlPattern.test(url);
  }
  getParticipantId(userId: number): Observable<number> {
    return this.partenservice.getPartenIdByUserId(userId);
  }
 
  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  
  addPrixVenteForArticle(enchereId: number, articleId: number) {
    if (this.prixproposerForm.valid) {
      const prixProposerControl = this.prixproposerForm.get('prixproposer');
      if (prixProposerControl) {
        const prixVenteValue = prixProposerControl.value.toString();
        const prixproposer = parseFloat(prixVenteValue.replace(',', '.'));
        
        if (!isNaN(prixproposer)) {
          console.log("this.userid", this.userid);
          this.partenservice.getPartenIdByUserIdd(this.userid,enchereId).subscribe(
            (participantId: number) => {
              console.log("participantId:", participantId);
              console.log("enchereId:", enchereId);
              console.log("prixproposer:", prixproposer);

              this.partenservice.addPrixVenteForArticle(participantId, prixproposer.valueOf(), enchereId).pipe(
                catchError((error: HttpErrorResponse) => {
                  console.error('Erreur interceptée:', error);
                  return of(error); // retourne un observable vide en cas d'erreur
                })
              ).subscribe(
                (response) => {
                  if (response instanceof HttpErrorResponse) {
                    console.error('Erreur lors de l\'ajout du prix de vente :', response);
                    this.snackBar.open('Erreur lors de l\'ajout du prix de vente.', 'Fermer', {
                      duration: 3000
                    });
                  } else {
                    console.log("Réponse du backend:", response);
                    this.prixproposerForm.reset();
                    this.updateEncheresAfterPrixVente();
                    this.snackBar.open('Le prix de vente a été ajouté avec succès.', 'Fermer', {
                      duration: 3000
                    });
               
                  }
                }
              );
            },
            (error) => {
              console.error("Erreur lors de la récupération de l'ID du participant :", error);
              this.snackBar.open("Erreur lors de la récupération de l'ID du participant.", 'Fermer', {
                duration: 3000
              });
            }
          );
        } else {
          console.error("La valeur du prix de vente n'est pas un nombre valide :", prixVenteValue);
          this.snackBar.open("Veuillez saisir un prix de vente valide.", 'Fermer', {
            duration: 3000
          });
       
        }
      }
    } else {
      console.log("Le formulaire de prix de vente n'est pas valide.");
      this.snackBar.open("Le formulaire de prix de vente n'est pas valide.", 'Fermer', {
        duration: 3000
      });
    }
  }
  
  updateEncheresAfterPrixVente() {
    // Appelez ici la méthode pour mettre à jour la liste d'enchères après avoir ajouté le prix de vente
    this.getAllEncheres();
  }
  panierDetails: any[] = [];
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
addToCart(article: any): void {
    // Logic to add the article to the cart
    console.log('Article added to cart:', article);

    // Display SweetAlert2 confirmation
    Swal.fire({
      title: 'Article ajouté!',
      text: 'L\'article a été ajouté au panier.',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        // Logic after the alert is confirmed
        console.log('OK button clicked');
        this.addedToCart[article.id] = true; // Mark this article as added to cart
        this.saveCartState(); // Save the cart state to localStorage
      }
    });
  }

  // Method to check if an article is added to the cart
  isArticleAddedToCart(articleId: number): boolean {
    return !!this.addedToCart[articleId];
  }

  // Save the cart state to localStorage
  saveCartState(): void {
    localStorage.setItem('addedToCart', JSON.stringify(this.addedToCart));
  }

  // Load the cart state from localStorage
  loadCartState(): void {
    const savedCartState = localStorage.getItem('addedToCart');
    if (savedCartState) {
      this.addedToCart = JSON.parse(savedCartState);
    }
  }
addedToCart: { [key: number]: boolean } = {}; 

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
                  this.partenservice.getPartenIdByUserId(userId).subscribe(
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
                                                this.loadEncheres();
                                                this.getAllEncheres();
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
}*/

/*createCart(partnerId: any, article: any) {
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

}