import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoriesAdminService } from '../categories.service';

interface Categorie {
  id: number;
  titre: string;
  description: string;
  image: string; 
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesAdminComponent implements OnInit {
  displayedColumns = ['title', 'description', 'image', 'actions'];
  public myForm!: FormGroup;
  public editMode: boolean = false;
  public categories: Categorie[] = [];
  public editCat: Categorie | null = null;
  public loading: boolean = false;
  public imageUrl: string = '';
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment
  editForm!: FormGroup; // Reactive form for editing
  onCreatee = false;
  newCategory: Categorie = {
    id: 0,
    titre: '',
    description: '',
    image: ''
  }; // Initialize as empty object
  constructor(
    private formBuilder: FormBuilder,
    private catService: CategoriesAdminService,
    private router: Router,
    private snackBar: MatSnackBar
) {
  this.myForm = this.formBuilder.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    image: ['',Validators.required]
  });
    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', Validators.required]
  });
  
}
  ngOnInit() {
    this.getAllCategories(); // Fetch categories on initialization
  }
  public links: any = [
    {
      title: 'Dashboard',
      items: [
        {
          name: 'overview',
          icon: 'fa-solid fa-house',
        }, {
          name: 'billboards',
          icon: 'fa-brands fa-bandcamp',
        }
      ],
    },

    {
      title: 'Pages',
      items: [
        {
          name: 'users',
          icon: 'fa-solid fa-users',
        }, {
          name: 'enchers',
          icon: 'fa-solid fa-bag-shopping',
        },
        {
          name: 'categorie',
          icon: 'fa-solid fa-dumpster-fire',
        },
        {
          name: 'article',
          icon: 'fa-solid fa-dumpster-fire',
        },
        {
          name: 'demande-vendeur',
          icon: 'fa-solid fa-users',
        },
        {
          name: 'commentaire',
          icon: 'fa-solid fa-comment',
        },
       {
          name: 'tags',
          icon: 'fa-solid fa-tag'
        }
      ],
    },

  ];

 

// [routerLink]="['/', item.name]
  public currentPath: string | undefined;

  public navigateTo(item: string) {

    this.router.navigate(['/', item]);

  }
  getAllCategories() {
    this.catService.getAllCategories().subscribe(
      categories => {
        this.categories = categories;
      },
      error => {
        console.error('Error fetching categories:', error);
        this.snackBar.open('Error loading categories!', 'Close', {
          duration: 4000
        });
      }
    );
  }

  public editCategory(category: Categorie) {
    this.editMode = true;
    this.editCat = category;
    this.editForm.patchValue({
        titre: category.titre,
        description: category.description,
        image: category.image 
    });
    this.imageUrl = category.image;
}

public deleteCategory(id: string) {
  this.catService.deleteCategoryById(id).subscribe(
    response => {
      if (typeof response === 'string') {
        this.snackBar.open('Categorie suuprimeé avec  succées!', 'Close', {
          duration: 3000
        });
        this.getAllCategories(); // Update list after deletion
        // Refresh the page
        window.location.reload();
      }
    },
    (error: HttpErrorResponse) => {
      console.error("Error de suppression  categorie:", error.error);
      window.location.reload();
      this.snackBar.open('Error  de suppression  categorie: ' + error.error, 'Close', {
        duration: 3000,
        
      } );
    }
  );
}
onCreate() {
    // Réinitialiser onCreatee à true pour afficher le formulaire
    this.onCreatee = true;
  
    // Vérifier si le formulaire est valide
    if (this.myForm.valid) {
      // Vérifier si le champ d'image contient une URL valide
      const imageUrl = this.myForm.value.image;
      if (imageUrl && imageUrl.trim() !== '') {
        // Créer la nouvelle catégorie avec l'URL de l'image
        const newCategory: Categorie = {
          titre: this.myForm.value.titre,
          description: this.myForm.value.description,
          image: imageUrl,
          id: 0 // Assuming auto-generated ID, adjust if needed
        };
  
        console.log('Envoi des données au backend.');
  
        // Appel au service pour créer une nouvelle catégorie
        this.catService.createCategory(newCategory).subscribe(
          response => {
            // Réinitialiser onCreatee à false après avoir ajouté avec succès
            this.onCreatee = false;
  
            // Handle successful creation
            this.myForm.reset(); // Clear form data
            this.imageUrl = ''; // Clear image preview
            this.getAllCategories(); // Update category list
            this.snackBar.open('Categorie ajoutée avec  succèes!', 'Close', {
              duration: 3000
            });
          },
          (error: HttpErrorResponse) => {
            console.error('Error ajout categorie:', error.error);
          
            let errorMessage: string;
          
            if (typeof error.error === 'object' && error.error.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = 'Unknown error occurred.';
            }
          
            this.snackBar.open('Error ajout categorie: ' + errorMessage, 'Close', {
              duration: 3000
            });
          }
        );
      } else {
        console.error('Error: No image URL provided.');
        this.snackBar.open('Error: No image URL provided.', 'Close', {
          duration: 3000
        });
      }
    }
  }
  
  cancelCreation() {
    this.onCreatee = false;
    this.myForm.reset(); // Réinitialise le formulaire
    this.imageUrl = ''; // Réinitialise l'aperçu de l'image
  }
  validateDataLength(newCategory: Categorie): boolean {
    // Vérifier la longueur des données avant de les envoyer au backend
    const MAX_LENGTH_TITLE = 255; // Longueur maximale autorisée pour le titre
    const MAX_LENGTH_DESCRIPTION = 1000; // Longueur maximale autorisée pour la description
  
    if (newCategory.titre.length > MAX_LENGTH_TITLE || newCategory.description.length > MAX_LENGTH_DESCRIPTION) {
      return false; // Les données dépassent la longueur maximale autorisée
    }
  
    return true; // Les données respectent les contraintes de longueur
  }


  onSubmit() {
    if (this.editMode) { // Editing existing category
      this.updateCategory(this.editCat!); // Pass editCat as the second argument
    } else { // Creating a new category
      this.onCreate();
    }
  }
  updateCategory(updatedCategory: Categorie) {
    if (this.editForm && this.editForm.valid && this.editCat) {
      const updatedCatData: Categorie = {
        id: this.editCat.id,
        titre: this.editForm.value.titre,
        description: this.editForm.value.description,
        image: this.editForm.value.image
      };
  
      // Valider l'URL de l'image
  
        this.catService.updateCategorie(updatedCatData.id.toString(), updatedCatData).subscribe(
          Response => {
            // Handle successful update
            this.editMode = false;
            this.editCat = null;
            this.myForm.reset();
            this.imageUrl = '';
            this.getAllCategories();
            this.snackBar.open('Category mise à jour avec  succées!', 'Close', {
              duration: 3000
            });
          },
          (error: HttpErrorResponse) => {
            console.error('Error  mise à jour  categorie:', error);
            this.snackBar.open('Error  mise à jour  categorie: ' + error.message, 'Close', {
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

  
  cancelEdit() {
    this.editMode = false; // Quitte le mode édition
    this.editCat = null; // Réinitialise la catégorie en cours d'édition
    this.myForm.reset(); // Réinitialise le formulaire d'édition
    this.imageUrl = ''; // Réinitialise l'aperçu de l'image
  } }