import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'https://projeto-blog-ad0bja.fly.dev/postagens'; // ajuste para sua URL

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  criarPost(postagem: any): Observable<any> {
    return this.http.post(this.apiUrl, postagem, { headers: this.getHeaders() });
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  editarPost(postagem: any): Observable<any> {
    return this.http.put(this.apiUrl, postagem, { headers: this.getHeaders() });
  }

  excluirPost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}