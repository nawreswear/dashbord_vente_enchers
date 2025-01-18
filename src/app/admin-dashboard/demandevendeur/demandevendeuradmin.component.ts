import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable,catchError,map,of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/_service/auth.service';
import { demandevendeurService } from 'src/app/vendeur-dashboard/demandevendeur.service';

interface Admin{
id: number;
type: string;
demandes: demande_Vendeur[];
}
interface demande_Vendeur {
  id: number| undefined;
  datedem: Date;
  etatdem: boolean;
  //user: { id: number | undefined, nom?: string,prenom?: string,type?: string};
  user: {
    id: number | undefined;
    nom?: string;
    prenom?: string;
    type?: string;
  };
  userId: number;
  admin:{ id: number | undefined}
}


@Component({
  selector: 'app-demandevendeuradmin',
  templateUrl: './demandevendeuradmin.component.html',
  styleUrls: ['./demandevendeuradmin.component.css']
})
export class DemandevendeurAdminComponent implements OnInit {
  demandesvendeurs: demande_Vendeur[] = [];
  vendorForm: FormGroup;
  activeRoute: string = '';
  userDetails: any; // Déclarer la variable userDetailserror: any // Définir le type d'erreur comme 'any'
  userEmail: string | null = null;
demande: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authservice: AuthService, private http: HttpClient,
    private serviceDemandeVendeur: demandevendeurService
  ) {
    this.vendorForm = this.fb.group({
      datedem: ['', Validators.required],
      etatdem: ['', [Validators.required]],
      user: [undefined, [Validators.required]],
    });
  }
  demandeVendeurs: demande_Vendeur[] = [];
  ngOnInit() {
    this.route.url.subscribe(url => {
      this.activeRoute = url[0].path;
     
    });
    this.chargerVendeursEnAttente();
    this.loadUserNames(this.demandesvendeurs);
  }
  recevoirDonneesVendeur(vendeur: any) {
    console.log('Données du vendeur reçues :', vendeur);
  }
  getAllDemandeVendeurs() {
    this.http.get<demande_Vendeur[]>('http://localhost:3002/demandesvendeurs/all')
        .subscribe(
            (data) => {
                this.demandeVendeurs = data;
            },
            (error) => {
                console.error('Une erreur s\'est produite lors de la récupération des demandes de vendeur : ', error);
            }
        );
}
/*  chargerVendeursEnAttente() {
    this.serviceDemandeVendeur.getAllDemandeVendeurs().subscribe(
      (demandes: any[]) => {
        this.demandesvendeurs = demandes;
        // Pour chaque demande de vendeur, récupérez les détails de l'utilisateur
        this.demandesvendeurs.forEach(demande => {
          // Vérifiez si l'ID de la demande est défini
          if (demande.id !== undefined) {
            this.getDemandeVendeurById(demande.id).subscribe(
              (demandeVendeur: any) => {
                // Vérifiez si demandeVendeur.user existe avant de l'assigner à demande.user
                if (demandeVendeur.user) {
                  demande.user = { id: demandeVendeur.user.id };
                } else {
                  console.error("L'utilisateur de la demande de vendeur n'est pas défini.");
                }
              },
              error => {
                console.error("Une erreur s'est produite lors de la récupération de la demande de vendeur :", error);
              }
            );
          } else {
            console.error("L'ID de la demande de vendeur est indéfini.");
          }
        });
      },
      error => {
        console.error("Une erreur s'est produite lors de la récupération des demandes de vendeur :", error);
      }
    );
}*/
chargerVendeursEnAttente() {
  this.serviceDemandeVendeur.getAllDemandeVendeurs().subscribe(
    (demandes: any[]) => {
      this.demandesvendeurs = demandes;
      // Pour chaque demande de vendeur, récupérez les détails de l'utilisateur
      this.loadUserNames(this.demandesvendeurs);
    },
    error => {
      console.error("Une erreur s'est produite lors de la récupération des demandes de vendeur :", error);
    }
  );
}

  getDemandeVendeurById(id: number): Observable<any> {
    return this.serviceDemandeVendeur.getDemandeVendeurById(id);
  }
  loadUserNames(demandes: demande_Vendeur[]) {
    demandes.forEach(demande => {
      if (demande.user && demande.user.id) {
        console.log("avant loadUserNames", demande.user.id);
        this.getUserById(demande.user.id.toString()).subscribe(
          userData => {
            demande.user.nom = userData.nom;
            console.log("loadUserNames:", demande.user.nom);
          },
          error => {
            console.error("Une erreur s'est produite lors de la récupération du nom d'utilisateur :", error);
          }
        );
      }
    });
  }
getUserById(userId: string): Observable<any> {
  return this.http.get<any>(`http://localhost:3003/getUserById/${userId}`); 
}
getUserIdByName(userName: string): Observable<number> {
  return this.http.get<number>(`http://localhost:3003/api/${userName}`);
}

updateUserType(userId: number): Observable<any> {
  return this.http.put(`http://localhost:3003/users/updateType/${userId}`, null);
}

updateDemandeEtat(id: number, nouvelEtat: boolean): Observable<any> {
  // Envoyer la requête HTTP PUT avec les données dans l'URL
  return this.http.put<any>(`http://localhost:3002/demandesvendeurs/${id}/etat?nouvelEtat=${nouvelEtat}`, {});
}

approuverDemande(demande: demande_Vendeur): void {
  if (demande && demande.id) {
    const demandeId = demande.id;
    const demandeUserNom = demande.user?.nom;

    if (!demandeUserNom) {
      console.error('Le nom de l\'utilisateur dans la demande de vendeur est indéfini.');
      return;
    }
    console.log('ID de  demande correspondant :', demandeId);
    console.log('nom de l\'utilisateur correspondant :', demandeUserNom);
    this.getUserIdByName(demandeUserNom).pipe(
      switchMap((userId: number) => {
        console.log('ID de l\'utilisateur récupéré :', userId);

        if (userId) {
          return this.updateUserType(userId).pipe(
            switchMap(() => {
              console.log('Type d\'utilisateur mis à jour avec succès.');
              return this.updateDemandeEtat(demandeId, true).pipe(
                map(() => {
                  console.log('État de la demande mis à jour avec succès.');
                  // Ajoutez d'autres actions si nécessaire
                  return true;
                }),
                catchError(error => {
                  console.error('Une erreur est survenue lors de la mise à jour de l\'état de la demande :', error);
                  return of(false);
                })
              );
            }),
            catchError(error => {
              console.error('Une erreur est survenue lors de la mise à jour du type d\'utilisateur :', error);
              return of(false);
            })
          );
        } else {
          console.error('ID de l\'utilisateur non trouvé.');
          return of(false);
        }
      }),
      catchError(error => {
        console.error('Une erreur est survenue lors de la récupération de l\'ID de l\'utilisateur :', error);
        return of(false);
      })
    ).subscribe(
      (success: boolean) => {
        if (success) {
          console.log('Demande de vendeur approuvée avec succès.');
          this.chargerVendeursEnAttente();
          // Ajoutez d'autres actions si nécessaire
        } else {
          console.error('Impossible d\'approuver la demande de vendeur.');
          // Gérez l'erreur si nécessaire
        }
      }
    );
  } else {
    console.error('Impossible d\'approuver la demande de vendeur : ID de demande non spécifié.');
  }
}

public deleteDemandeVendeur(id: number): Observable<void> {
  return this.http.delete<void>(`http://localhost:3002/demandesvendeurs/${id}`);
}

rejeterVendeur(vendeur: demande_Vendeur): void {
  if (vendeur && vendeur.id) {
    const vendeurId = vendeur.id;
    this.deleteDemandeVendeur(vendeurId).subscribe(
      () => {
        console.log('Le vendeur a été rejeté avec succès.');
        this.chargerVendeursEnAttente();
      },
      (error) => {
        console.error('Une erreur s\'est produite lors du rejet du vendeur :', error);
        // Gérez l'erreur si nécessaire
      }
    );
  } else {
    console.error('Impossible de rejeter le vendeur : ID de vendeur non spécifié.');
  }
}
  navigateTo(item: string) {
    this.router.navigate(['/', item]);
  }


}
