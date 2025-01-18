import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '../article.service';
import {   Observable, forkJoin, map } from 'rxjs';
import { EnchereService } from '../enchers-service.service';
import { Router } from '@angular/router';

interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  etat:string;
  admin: { id: number };
  articles: { id: number };
}
interface admin{
  id?: number;
}
interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix:string;
  livrable:boolean;
  statut:string;
  quantiter?: number;
  idEnchere?: number;
}

interface Part_En{
  id: number;
}
@Component({
  selector: 'app-enchers',
  templateUrl: './enchers.component.html',
  styleUrls: ['./enchers.component.css']
})
export class EnchersComponent implements OnInit {
  username: string | null = null;
  idadd: number = 0; 
// Déclaration de la fonction dans la classe de composant
parseDate(dateString: string): number | undefined {
  return parseInt(dateString, 10); // Convertit la chaîne en nombre entier
}
enchereEnCours: any; 
  public myForm!: FormGroup;
  public encheres: Enchere[] = [];
  public loading: boolean = false;
  public editMode: boolean = false;
  public editForm!: FormGroup;
  public articles: any[] = [];
  public partens: any[] = [];
  public admins: any[] = [];
  public showAddForm: boolean = false; 
  public formattedDateDebut!: string;
  public formattedDateFin!: string;
  updatedArticles: any = {};
  adminNames: { [key: number]: string } = {}
  constructor(private http: HttpClient,
    private formBuilder: FormBuilder,
    private encherService: EnchereService,
    private snackBar: MatSnackBar,
   private articleService: ArticleService,
   private router: Router,
  ) {
    this.myForm = this.formBuilder.group({
      id: [0],
      dateFin: [new Date()],//,[Validators.required, dateFormatValidator]
      dateDebut: [new Date()],
      etat:'',
      admin: ['', Validators.required], 
      articles: ['', Validators.required]// Utilisez control au lieu de array
    });
    
    this.editForm = this.formBuilder.group({
      id: [0],
      dateFin: [new Date()],
      dateDebut: [new Date()],
      etat:'',
      admin: ['', Validators.required], 
      articles: ['', Validators.required], // Contrôle pour les articles 
      updatedArticles: this.formBuilder.control('') // Ajoutez ce contrôle pour les articles mis à jour
    });
    this.formattedDateDebut = this.formatDate(this.myForm.value.dateDebut);
    this.formattedDateFin = this.formatDate(this.myForm.value.dateFin);
  }

  ngOnInit() {
    this.getAllEncheres();
    this.getAllArticles();
    this.getAllPartens();
    this.getAllAdmins();
    this.loadEncheres();
    this.encherService.getAllEncheres().subscribe(
      (encheres: Enchere[]) => {
        this.encheres = encheres;
        this.encheres.forEach(enchere => {
          if (!enchere.articles) {
            enchere.articles = { id: 0 }; // Ou toute valeur par défaut appropriée
          }
        });
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des enchères :', error);
      }
    );
  }

  loadEncheres(): void {
    this.encherService.getAllEncheres().subscribe(encheres => {
      this.encheres = encheres;
      this.loadAdminNames();
    });
  }
  loadAdminNames(): void {
    const adminRequests: Observable<any>[] = [];

    this.encheres.forEach(enchere => {
      if (enchere.admin && enchere.admin.id !== undefined) {
        adminRequests.push(
          this.encherService.getAdminById(enchere.admin.id).pipe(
            map(admin => ({ id: enchere.admin.id, name: admin.nom }))
          )
        );
      }
    });

    forkJoin(adminRequests).subscribe(admins => {
      admins.forEach(admin => {
        this.adminNames[admin.id] = admin.name;
      });
    });
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
         const username = tokenPayload.sub;
        console.log('ID de l\'utilisateur trouvéeeeee :', username);
        this.encherService.findUserIdByNom(username).subscribe(
          (userId  :any)=> {
            console.log('ID de l\'utilisateur trouvé :', userId);
            // Maintenant, vous avez l'ID de l'utilisateur, vous pouvez récupérer le partenaire ID
            this.idadd=userId;
          },
           (Error :any) =>{
            console.error('Erreur lors de la récupération de l\'ID de l\'utilisateur :', Error);
          }
        );
      }
    }
  }

  participer() {
    const partEn: Part_En = {
      id: 1 
    };
    this.addPartEn(partEn).subscribe(
      (result: Part_En) => {
        // Gérez la réponse si nécessaire
        console.log('Participation réussie :', result);
        this.snackBar.open('Vous avez participé avec succès!', 'Fermer', {
          duration: 3000
        });
      },
      (error: any) => {
        console.error('Erreur lors de la participation :', error);
        this.snackBar.open('Erreur lors de la participation', 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  addPartEn(partEn: Part_En): Observable<Part_En> {
    return this.encherService.addPart_En(partEn);
  }
  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return ''; // Si le timestamp est indéfini, retourne une chaîne vide

    const date = new Date(timestamp); // Crée une nouvelle instance de Date à partir du timestamp

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day}  ${hours}:${minutes}`;
}


getAllArticles() {
  this.articleService.getAllArticles().subscribe(
    (articles: Article[]) => {
      this.articles = articles;
    },
    (error: HttpErrorResponse) => {
      console.error('Error fetching articles:', error);
    }
  );
}
addSelectedArticle(articleId: number) {
  const articlesControl = this.myForm.get('articles');
  if (articlesControl) {
    const selectedArticles = articlesControl.value as number[];
    if (!selectedArticles.includes(articleId)) {
      selectedArticles.push(articleId);
      articlesControl.setValue(selectedArticles);
    }
  }
}
  getAllPartens() {
    this.encherService.getAllPartens().subscribe(
      (partens: any[]) => {
        this.partens = partens;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching partens:', error);
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
  
  getAllEncheres() {
    this.loading = true;
    this.encherService.getAllEncheres().subscribe(
      (encheres: Enchere[]) => {
        this.encheres = encheres;
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching encheres:', error);
        this.loading = false;
        this.snackBar.open('Error loading encheres!', 'Close', { duration: 3000 });
      }
    );
  }

  async getArticleTitle(articleId: number): Promise<string> {
    try {
        const article = this.articles.find(article => article.id === articleId);
        if (article) {
            return article.description;
        } else {
          console.error('Une erreur s\'est produite lors de la récupération du titre de l\'article :');
            return ''; // Ou renvoyez une valeur par défaut
        }
    } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération du titre de l\'article :', error);
        return ''; // Ou renvoyez une valeur par défaut en cas d'erreur
    }
}

participerEnchere(userId: number, enchereId: number) {
  this.encherService.participateInEnchere(userId, enchereId).subscribe(
    () => {
      this.getAllEncheres(); // Met à jour la liste des enchères après la participation
    },
    (error: HttpErrorResponse) => {
      if (error.status !== 200) {
        console.error('Erreur lors de la participation à l\'enchère :', error);
        // Affichez un message d'erreur à l'utilisateur uniquement si le statut de la réponse est différent de 200
        this.snackBar.open('Erreur lors de la participation à l\'enchère', 'Fermer', {
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
 onCreate() {
    this.showAddForm = true;
    if (this.myForm.valid) {
      const selectedUser = this.partens.find(partner => partner.id === this.myForm.value.parten);
     // const selectedAdmin = this.admins.find(admin => admin.id === this.myForm.value.admin);
      const selectedArticle = this.articles.find(article => article.id === this.myForm.value.articles);
      if (selectedUser) {
        const newEnchere: Enchere = {
          id: this.myForm.value.id,
          dateFin: this.formattedDateFin,
          dateDebut: this.formattedDateDebut,
          etat:'en cours',
          admin: { id: this.idadd },
          articles: { id: selectedArticle.id }
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
    // Réinitialisez le formulaire d'enchère
    this.myForm.reset();
    this.showAddForm=false;
  }
  editEnchere(enchere: Enchere): void {
    if (enchere && enchere.id !== undefined) {
      this.editMode = true;
      console.log("enchere.id", enchere.id);
      
      if (enchere.articles && enchere.articles.id !== undefined) {
        console.log("enchere.articles.id", enchere.articles.id);
        
        if (!this.admins.length || !this.articles.length) {
          this.loadAdminsAndArticles().then(() => {
            this.setFormValues(enchere);
          });
        } else {
          this.setFormValues(enchere);
        }
      } else {
        console.error("Les articles de l'enchère sont indéfinis ou ne contiennent pas d'ID.", enchere.articles.id);
      }
    } else {
      console.error("L'enchère ou son identifiant est indéfini.");
    }
  }
  
  private loadAdminsAndArticles(): Promise<void> {
    return Promise.all([
      this.loadAdmins(),
      this.loadArticles()
    ]).then(() => {});
  }
  
  private setFormValues(enchere: Enchere): void {
    // Utilisez setTimeout pour garantir que le formulaire est mis à jour après le chargement des articles
    setTimeout(() => {
      this.editForm.patchValue({
        id: enchere.id,
        dateDebut: this.formatDateForInput(enchere.dateDebut),
        dateFin: this.formatDateForInput(enchere.dateFin),
        admin: enchere.admin.id,
        articles: enchere.articles.id || this.articles[0]?.id
      });
    });
  }
  
  private loadAdmins(): Promise<void> {
    return this.encherService.getAllAdmins().toPromise().then((admins) => {
      this.admins = admins || [];
    });
  }
  
  private loadArticles(): Promise<void> {
    return this.encherService.getAllArticles().toPromise().then((articles) => {
      this.articles = articles || [];
    });
  }
    // Fonction pour formater la date pour l'input type="datetime-local"
    private formatDateForInput(date: string): string {
      const d = new Date(date);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    
  onSubmit(): void {
    if (this.editMode && this.editForm.valid) {
      const updatedEnchere: Enchere = {
          id: this.editForm.value.id,
          dateFin: this.editForm.value.dateFin,
          dateDebut: this.editForm.value.dateDebut,
          etat:'en cours',
          admin: { id: this.editForm.value.admin },
          articles: { id: this.editForm.value.articles }
      };
  
      if (updatedEnchere.id && updatedEnchere.id > 0) {
          console.log("updatedEnchere.id", updatedEnchere.id);
          this.encherService.updateEnchere(updatedEnchere.id, updatedEnchere).subscribe(
              (response: any) => {
                  console.log("response.id", response.id);
                  // Exécuter d'abord la mise à jour de l'identifiant des enchères
                  this.encherService.updateIdEncherss(updatedEnchere.articles.id, response.id).subscribe(
                      () => {
                          // Ensuite, effectuer le nettoyage
                          this.encherService.clearEnchereFromOtherArticles(updatedEnchere.articles.id, response.id).subscribe(
                              () => {
                                  this.editForm.reset();
                                  this.editMode = false;
                                  this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
                              },
                              (error: HttpErrorResponse) => {
                                  console.error('Erreur clearEnchereFromOtherArticles :', error);
                                  this.snackBar.open('Erreur lors de la mise à jour des articles', 'Fermer', { duration: 3000 });
                              }
                          );
                      },
                      (error: HttpErrorResponse) => {
                         // console.error('Erreur updateIdEnchersss :', error);
                          this.snackBar.open('Erreur lors de la mise à jour de l\'identifiant des enchères', 'Fermer', { duration: 3000 });
                      }
                  );
              },  (error: HttpErrorResponse) => {
                if (error.status === 500) {
                 // console.error('Enchère mise à jour avec succès!', error);
                  this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
                } else {
                  //console.error('Erreur lors de la mise à jour de l\'enchère :', error);
                }
                this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
              } 
            
          );
         
        
      } else {
          console.error('L\'ID de l\'enchère n\'est pas défini ou est égal à zéro.');
      }
  } else {
    //if (this.myForm.valid) {
      const currentDate = new Date(); // Obtenir la date actuelle
      const selectedDateDebut = new Date(this.myForm.value.dateDebut); 
      if (selectedDateDebut >= currentDate) { // Vérifier si la date de début est égale ou supérieure à la date actuelle
        const newEnchere: Enchere = {
          id: this.myForm.value.id,
          dateFin: this.myForm.value.dateFin,
          dateDebut: selectedDateDebut.toISOString(), // Utiliser la date sélectionnée dans le formulaire
          etat: 'en cours',
         // admin: { id: this.myForm.value.admin },
         admin: { id: this.idadd },
          articles: { id: this.myForm.value.articles }
        };
         console.log("fffff",newEnchere);
        this.encherService.addEnchere(newEnchere).subscribe(
          (response: any) => {
            this.encheres.push(response);
            this.updateArticle(newEnchere.articles.id, response.id);
            this.myForm.reset();
            this.snackBar.open('Enchère créée avec succès!', 'Fermer', { duration: 3000 });
          },
          (error: HttpErrorResponse) => {
            console.error('Erreur lors de la création de l\'enchère :', error);
            this.snackBar.open('Erreur lors de la création de l\'enchère', 'Fermer', { duration: 3000 });
          }
        );
      } else {
        console.error('La date de début doit être égale ou supérieure à la date actuelle.');
        this.snackBar.open('La date de début doit être égale ou supérieure à la date actuelle.', 'Fermer', { duration: 3000 });
      }
   /* } else {
      console.error('Formulaire non valide.');
      this.snackBar.open('Formulaire non valide.', 'Fermer', { duration: 3000 });
    }*/
    
    }
  }
  
  
  updateArticle(articleId: number, enchereId: number): void {
    this.encherService.updateIdEncherss(articleId, enchereId).subscribe(
      () => {
        console.log('Article mis à jour avec succès');
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour de l\'article :', error);
        this.snackBar.open('Erreur lors de la mise à jour de l\'article', 'Fermer', { duration: 3000 });
      }
    );
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
    this.editForm.reset();
    this.editMode = false;
  }
  updateEnchere(enchereId: number, updatedEnchere: Enchere): void {
    this.encherService.updateEnchere(enchereId, updatedEnchere).subscribe(
      () => {
        const index = this.encheres.findIndex(enchere => enchere.id === enchereId);
        if (index !== -1) {
          this.encheres[index] = updatedEnchere;
        }
        this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
      },
      (error: HttpErrorResponse) => {
        if (error.status === 500) {
         /// console.error('Erreur interne du serveur lors de la mise à jour de l\'enchère :', error);
        } else {
         // console.error('Erreur lors de la mise à jour de l\'enchère :', error);
        }
        this.snackBar.open('Erreur lors de la mise à jour de l\'enchère', 'Fermer', { duration: 3000 });
      }
    );
  }
  
  
  
  public currentPath: string | undefined;

  public navigateTo(item: string) {

    this.router.navigate(['/', item]);

  }
}
