import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './_service/user';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

export interface Message {
  id?: string; // Modification de l'ID pour correspondre à Firestore
  message: string; // Renommage de 'message' à 'text'
  date: Date;
  user?: User;
  users?: User[];
}
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private localMessages: Message[] = [];
  messages: Observable<any[]>;
  private baseUrl = 'http://localhost:3007/'; // Remplacez par l'URL de votre serveur Spring
  private messagesCollection: AngularFirestoreCollection<Message>;

  constructor(private http: HttpClient,private firestore: AngularFirestore) {
    this.messagesCollection = this.firestore.collection<Message>('messages');
    this.messages = this.messagesCollection.valueChanges();
   }
   syncDataFromLocalToFirebase(): void {
    // 1. Lire les données locales
    const localData = this.localMessages; // Mettez ici la méthode pour récupérer les données locales

    // 2. Écrire les données dans Firebase
    localData.forEach(data => {
      this.firestore.collection('your-firebase-collection').add(data)
        .then(() => console.log('Données écrites avec succès dans Firebase'))
        .catch(error => console.error('Erreur lors de l\'écriture des données dans Firebase :', error));
    });
  }
  /*getMessages(): Observable<any> {
    return this.http.get(this.baseUrl + 'message');
  }*/
  getFirestoreMessages(): Observable<Message[]> {
    return this.messagesCollection.valueChanges();
  }
 getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>('http://localhost:3007/message');
  }
  getMessageById(id: number): Observable<any> {
    return this.http.get(this.baseUrl + 'messages/' + id);
  }

  createMessage(message: any): Observable<any> {
    return this.http.post('http://localhost:3007/messages/', message);
  }

 deleteMessage(id: number): Observable<any> {
    return this.http.delete('http://localhost:3007/messages/' + id);
  }
 /* sendMessage(text: string, user: User): void {
    const message: Message = {
      message: text,
      date: new Date(),
      user: user
    };
    this.createMessage(message);
  }*/
  sendMessage(text: string, user: User): void {
    const message: Message = {
      message: text,
      date: new Date(),
      user: user
    };
    // Envoyer le message au serveur backend
    this.createMessage(message).subscribe(
      () => {
        console.log('Message envoyé au serveur backend avec succès');
      },
      error => {
        console.error('Erreur lors de l\'envoi du message au serveur backend :', error);
      }
    );
  }
  
}