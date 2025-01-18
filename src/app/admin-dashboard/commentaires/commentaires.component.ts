import { Component, OnInit } from '@angular/core';
import {  CommentaireService } from 'src/app/commentaire.service';

interface Commentaire {
  id: number;
  object: string;
  message: string;
  date: Date;
  user: {id:number,nom:string,photo:string};
  article: {id:number};
}
@Component({
  selector: 'app-commentaires',
  templateUrl: './commentaires.component.html',
  styleUrls: ['./commentaires.component.css']
})
export class CommentairesComponent implements OnInit {
  commentaires: Commentaire[] = [];

  constructor(private commentaireService: CommentaireService) { }

  ngOnInit(): void {
    this.getAllCommentaires();
  }

  getAllCommentaires(): void {
    this.commentaireService.getAllCommantaires().subscribe(
      commentaires => {
        this.commentaires = commentaires;
      },
      error => {
        console.error('Une erreur est survenue lors de la récupération des commentaires : ', error);
      }
    );
  }

  
// Supprimer un commentaire
supprimerCommentaire(commentaireId: number): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    this.commentaireService.supprimerCommentaire(commentaireId).subscribe(
      () => {
        // Supprimer le commentaire du tableau commentaires
        this.commentaires = this.commentaires.filter(commentaire => commentaire.id !== commentaireId);
        console.log('Commentaire supprimé avec succès.');
      },
      error => {
        console.error('Une erreur est survenue lors de la suppression du commentaire : ', error);
      }
    );
  }
}

}
