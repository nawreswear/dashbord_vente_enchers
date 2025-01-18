import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';


import { UserServiceService } from '../user-service.service';
import { CategoriesAdminService } from '../categories.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  activeRoute: string = ''; 
  public user: any[] = [];

  public orders: any;

  public Costumers:any[] = [];

  public Totalamount:number = 0;

  public nbOrders:number = 0;

  public errorMsg:any[] = [];

  public cats:any[]=[];

  public tags:any[]=[];

  public comments:any[]=[];
  public isFirstLoad: boolean = false;

  constructor(
   // private productService: UserServiceService,
    
    private http:HttpClient,
    private router:Router,
    private catS:CategoriesAdminService,
    private route: ActivatedRoute
  ){}

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

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      // Extract the active route from the URL segments
      this.activeRoute = url[0].path;
    });
  }   

// [routerLink]="['/', item.name]
  public currentPath: string | undefined;

  public navigateTo(item: string) {

    this.router.navigate(['/', item]);

  }
 

}
