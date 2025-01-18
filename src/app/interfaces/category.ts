export interface Category {
  id: number;
  titre: string;
  description: string;
  image: string;
  _id?: string;
}

export interface CategoryForm { 
  titre: string;
  description: string;
  image: string;
}
