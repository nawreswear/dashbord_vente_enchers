import { Component, Input, Output, EventEmitter } from '@angular/core';

interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  livrable: boolean;
  statut: string; 
  quantiter: number;
}
interface Categorie {
  id: number;
  titre: string;
  description: string;
  image: string; 
}

@Component({
  selector: 'category-articles',
  templateUrl: './category-articles.component.html',
  styleUrls: ['./category-articles.component.css']
})
export class CategoryArticlesComponent {
  @Input() category: any;
  @Input() articles: any[] = []; // Initialize with an empty array
  @Output() close = new EventEmitter<void>();

  isValidURL(url: string): boolean {
    // Validation simple de l'URL
    return url.startsWith('http://') || url.startsWith('https://');
  }

  closeDetails() {
    this.close.emit();
  }

}