import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User } from 'src/app/_service/user';
import { FormControl, FormGroup } from '@angular/forms'; 
import { UserServiceService } from '../../user-service.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UtulisateursComponent implements OnInit {

  currentRoutePath: string = '';
  users: MatTableDataSource<User> = new MatTableDataSource<User>();
  columns: string[] = ['nom', 'prenom', 'email', 'tel','photo', 'type', 'password', 'cin'];
  showAlert: boolean = false; 
  // Créez un FormGroup
  userForm: FormGroup = new FormGroup({});

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment
 
  constructor(private userService: UserServiceService,private router:Router,private route: ActivatedRoute) { } 
  ngOnInit(): void {
    // Initialisez le FormGroup et les FormControl correspondants
    this.userForm = new FormGroup({
      id: new FormControl(),
      nom: new FormControl(),
      prenom: new FormControl(),
      email: new FormControl(),
      tel: new FormControl(),
      type: new FormControl(),
      password: new FormControl(),
      cin: new FormControl(),
    });

    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = new MatTableDataSource<User>(data);
        this.users.paginator = this.paginator;
        this.users.sort = this.sort;
      },
      (error: any) => { 
        console.error("Une erreur est survenue lors de la récupération des utilisateurs :", error);
      }
    );
  }  
  deleteUser(userId: string) {
    this.userService.deleteUser(userId).subscribe((res) => {
      console.log(res);
      const data = this.users.data.filter(
        (item: User) => item.id !== userId
      );
      this.users.data = data;
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;
         
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
  hideAlert(): void {
    this.showAlert = false;
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



//[routerLink]="['/', item.name]";
public currentPath: string | undefined;

public navigateTo(item: string) {

  this.router.navigate(['/', item]);

}
}
