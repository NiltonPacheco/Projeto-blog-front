import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://projeto-blog-ad0bja.fly.dev/usuarios';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  login(usuario: string, senha: string): Observable<any> {
    // Corrigido: endpoint de login e envio do body correto
    return this.http.post(
      `${this.apiUrl}/login`,
      { usuario, senha },
      this.httpOptions
    );
  }

  registrar(usuario: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/cadastrar`,
      usuario,
      this.httpOptions
    );
  }

  salvarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obterToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}