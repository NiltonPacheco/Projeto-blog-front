import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tema } from '../models/tema.model';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private apiUrl = 'https://projeto-blog-ad0bja.fly.dev/temas';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tema[]> {
    return this.http.get<Tema[]>(this.apiUrl);
  }

  criarTema(tema: { descricao: string }): Observable<Tema> {
    return this.http.post<Tema>(this.apiUrl, tema, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}