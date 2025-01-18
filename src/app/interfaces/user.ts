export class  User {
  
  id:string='';
  nom: string = '';
  email: string = '';
  password: string = '';
  prenom: string = '';
  tel: string = '';
  type: string[] = []; 
  codePostal: number = 0; 
  pays: string = ''; 
  ville: string = ''; 
  cin: number = 0; 
  longitude: number = 0; 
  latitude: number = 0;
  photo: string='';
}
export interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface AuthFulFilled {
  token: string;
  userID: string;
}
