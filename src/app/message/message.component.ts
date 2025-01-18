/*import { Component, OnInit } from '@angular/core';
import { MessageService, Message } from '../message.service';
import { AuthService } from '../_service/auth.service';
import { User } from '../_service/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnchersServiceService } from '../enchers-service.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  messages: Observable<Message[]> | undefined; // Observable des messages
  user: User; // Utilisateur actuel
  messageText: string = ''; // Texte du message à envoyer
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();

  constructor(private messageService: MessageService, private authService: AuthService,
    private encherService: EnchersServiceService,
  ) {   this.user = new User();}

  ngOnInit(): void {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        this.encherService.findUserIdByNom(username).subscribe(
          (userId: number) => {
            this.authService.getUserById(userId).subscribe(
              (user: User) => {
                this.user = user;
              },
              (error: any) => {
                console.error('Erreur lors de la récupération de l\'utilisateur :', error);
              }
            );
          },
          (error: any) => {
            console.error('Erreur lors de la recherche de l\'ID utilisateur :', error);
          }
        );
      }
      this.token.next(storedToken);
    }
    this.messages = this.messageService.getMessages();
  }
  
  sendMessage(): void {
    if (this.messageText.trim() !== '') {
      this.messageService.sendMessage(this.messageText,this.user); // Passer le texte du message
      this.messageText = '';
    }
  }
}*/
import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { Database, getDatabase, ref, set, onValue  } from "firebase/database";
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { MessageService } from '../message.service';
import { EnchereService } from '../admin-dashboard/enchers-service.service';
import { AuthService } from '../_service/auth.service';
import { User } from '../_service/user';
import { EnchersServiceService } from '../enchers-service.service';

export interface Chat {
  id?: string;
  username: string;
  userreceive:string;
  message: string;
  timestamp: Date;
}
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  //user: User;
  title = 'firechat';
  app: FirebaseApp;
  db: Database;
  form: FormGroup;
  username = ''; // Contient le nom de l'utilisateur connecté
  message = '';
  chats: Chat[] = [];

  constructor(private formBuilder: FormBuilder, private messageService:MessageService,
    // private encherService:EnchersServiceService,
  // private authService:AuthService
  ) { //this.user = new User();
    this.app = initializeApp(environment.firebaseConfig);
    this.db = getDatabase(this.app);
    this.form = this.formBuilder.group({
      'message': [],
      'username': [this.username], // Définir le nom d'utilisateur par défaut
      'userreceive': [null], // Initialiser userreceive à null
    });
  }

  ngOnInit(): void {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        this.username = tokenPayload.sub; // Récupérer le nom d'utilisateur à partir du token
      }
    }

    const chatsRef = ref(this.db, 'chats');
    onValue(chatsRef, (snapshot: any) => {
      const data = snapshot.val();
      for (let id in data) {
        if (!this.chats.map(chat => chat.id).includes(id)) {
          this.chats.push(data[id])
        }
      }
    });
  }

  onChatSubmit(form: any) {
    const chat = form;
    chat.timestamp = new Date().toString();
    chat.id = uuidv4();
    chat.username = this.username; // Récupérer le nom d'utilisateur connecté
    // Mettre à jour userreceive avec le nom d'utilisateur saisi dans le formulaire
    chat.userreceive = form.userreceive;
    set(ref(this.db, `chats/${chat.id}`), chat);
    this.form.reset(); // Réinitialiser le formulaire après l'envoi
  }
}   