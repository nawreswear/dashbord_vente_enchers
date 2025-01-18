import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../_service/user';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private apiUrl = 'http://localhost:3003';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> { 
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  addUser(user: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<any>(`${this.apiUrl}/signup`, user,httpOptions)
  
  }
 
  public deleteAllUsers(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }

  public update(userId: string, userData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const updateUrl = `${this.apiUrl}/update/${userId}`;
    return this.http.put(updateUrl, userData,httpOptions);
  }

  public deleteUser(userId: string): Observable<any> {
    const deleteUrl = `${this.apiUrl}/deleteUser/${userId}`;
    return this.http.delete(deleteUrl);
  }

  public getUserById(userId: string): Observable<any> {
    const getUrl = `${this.apiUrl}/getUserById/${userId}`;
    return this.http.get<any>(getUrl); 
  }
  public checkEmailUnique(email: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const checkEmailUrl = `${this.apiUrl}/checkEmailUnique`;
    return this.http.post<any>(checkEmailUrl, email, httpOptions);
  }
}
