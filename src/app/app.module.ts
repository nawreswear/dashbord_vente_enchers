// Imports Angular
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Route, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// Imports externes
import { MatCardModule } from '@angular/material/card';
import { ToastrModule } from 'ngx-toastr';
import { JwtModule } from '@auth0/angular-jwt';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { MatIconModule } from '@angular/material/icon';
// Components
import { AppComponent } from './app.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { FeatureComponent } from './components/feature/feature.component';
import { FooterComponent } from './components/footer/footer.component';
import { FilterComponent } from './components/filter/filter.component';
import { SearchComponent } from './components/search/search.component';
import { HeaderComponent } from './admin-dashboard/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ArticlesComponent } from './articles/articles.component';
import { CategoriesComponent } from './categories/categories.component';
import { AboutComponent } from './about/about.component';
import { VendeurDashboardComponent } from './vendeur-dashboard/vendeur-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SidebarComponent } from './admin-dashboard/sidebar/sidebar.component';
import { UserEditComponent } from './admin-dashboard/users-routes/edit/edit.component';
import { UserDetailComponent } from './admin-dashboard/users-routes/users-detail/user-detail.component';
import { UtulisateursComponent } from './admin-dashboard/users-routes/users/users.component';
import { NewUserComponent } from './admin-dashboard/users-routes/new-user/new-user.component';
import { OverviewComponent } from './admin-dashboard/overview/overview.component';
import { EnchersComponent } from './admin-dashboard/enchers/enchers.component';
import { EnchersuserComponent } from './enchers/enchers.component';
import { CategoriesAdminComponent } from './admin-dashboard/categories/categories.component';
import { ArticlesAdminComponent } from './admin-dashboard/articles/articles.component';
import { DemandevendeurAdminComponent } from './admin-dashboard/demandevendeur/demandevendeuradmin.component';
import { DemandevendeurComponent } from './vendeur-dashboard/demandevendeur/demandevendeur.component';
import { ArticlesVendeurComponent } from './vendeur-dashboard/articles/articles.component';
import { PaimentComponent } from './admin-dashboard/paiment/paiment.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PartEnComponent } from './admin-dashboard/part-en/part-en.component';
import { DetailArtComponent } from './detail-art/detail-art.component';
import { ModificationCommentaireDialog } from './modification-commentaire/modification-commentaire.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommentairesComponent } from './admin-dashboard/commentaires/commentaires.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { SignalementComponent } from './signalement/signalement.component';
import { SignalisationComponent } from './admin-dashboard/signalisation/signalisation.component';
import { MessageComponent } from './message/message.component';
import { environment } from './environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DetailArticleDialogComponent } from './detail-article-dialog/detail-article-dialog.component';
import { CategoryArticlesComponent } from './category-articles/category-articles.component';
const routes: Route[] = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'navbar', component: NavbarComponent },
      {path: 'register',component: RegisterComponent},
      { path: 'articles', component: ArticlesComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'enchere', component: EnchersuserComponent },
      { path: 'about', component: AboutComponent },
      { path: 'demandevendeur', component: DemandevendeurComponent },
      { path: 'articles/vendeur/articlesvendeur', component: ArticlesVendeurComponent },
      { path: 'detail-article/:id', component: DetailArtComponent },
      { path: 'messages', component: MessageComponent },

    ],
  },
  {
    path: 'vendeur',
    component: HomeLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'navbar', component: NavbarComponent },
      {path: 'register',component: RegisterComponent},
      { path: 'articles', component: ArticlesComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'enchere', component: EnchersuserComponent },
      { path: 'about', component: AboutComponent },
      { path: 'articlesvendeur', component: ArticlesVendeurComponent },
      { path: 'detail-article/:id', component: DetailArtComponent },
      { path: 'messages', component: MessageComponent },
      //{ path: 'article', component: NotFoundComponent },
      //{ path: 'categorie', component: NotFoundComponent },
     // { path: 'demande-vendeur', component: NotFoundComponent},
  
    
    ],
  },
      {path: 'admin',component: AdminDashboardComponent},  
      { path: 'overview', component: OverviewComponent },
      { path: 'users', component: UtulisateursComponent}, 
      { path: 'users/:userId/edit', component: UserEditComponent },
      { path: 'users/:id', component: UserDetailComponent },    
      { path: 'admin/users/new', component: NewUserComponent},   
      { path: 'header', component: HeaderComponent },    
      { path: 'enchers', component: EnchersComponent },
      { path: 'article', component: ArticlesAdminComponent },
      { path: 'categorie', component: CategoriesAdminComponent },
      { path: 'demande-vendeur', component: DemandevendeurAdminComponent}, 
      { path: 'paiment', component: PaimentComponent},
      { path: 'parten', component: PartEnComponent},
      { path: 'commentaires', component: CommentairesComponent},
      { path: 'signalisation', component: SignalisationComponent},
      { path: 'messages', component: MessageComponent },
      //{ path: 'articles', component: NotFoundComponent },
     // { path: 'categories', component: NotFoundComponent },
      //{ path: 'demandevendeur', component: NotFoundComponent},
    
];
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    ArticlesVendeurComponent,
    ArticlesAdminComponent,
    NotFoundComponent,
    CommentairesComponent,
    CategoriesAdminComponent,
    LoginComponent,
    ArticlesComponent,
    DemandevendeurAdminComponent,
    CategoriesComponent,
    HomeComponent,
    RegisterComponent,
    NavbarComponent,
    SidebarComponent,
    DemandevendeurAdminComponent,
    DemandevendeurComponent,
    DemandevendeurComponent,
    NewUserComponent,
    UtulisateursComponent,
    CategoriesComponent,
    OverviewComponent,
    HeaderComponent,
    UserDetailComponent,
    UserEditComponent,
    CarouselComponent,
    FeatureComponent,
    FooterComponent,
    FilterComponent,
    SearchComponent,
    ToastComponent,
    DashboardComponent,
    HomeLayoutComponent,
    AboutComponent,   
    VendeurDashboardComponent,
    AdminDashboardComponent,
    EnchersComponent,
    EnchersuserComponent,
    ArticlesComponent,
    CategoriesComponent,
    PaimentComponent,
    PartEnComponent,
    DetailArtComponent,
    ModificationCommentaireDialog,
    CommentairesComponent,
    SignalementComponent,
    SignalisationComponent,
    MessageComponent,
    DetailArticleDialogComponent,
    CategoryArticlesComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDialogModule,
    BrowserModule,
    MatIconModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatListModule,
    RouterModule.forRoot(routes),
    ToastrModule.forRoot({
      timeOut: 3000,
      closeButton: true,
      enableHtml: true,
      easing: 'ease-in-out',
      progressBar: true,
      tapToDismiss: true,
    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('token');
        },
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BreadcrumbModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [],
  exports: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
