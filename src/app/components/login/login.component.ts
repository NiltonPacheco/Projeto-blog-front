import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  registrando = false;
  nome = '';
  usuario = '';
  senha = '';
  confirmarSenha = '';
  erro = '';
  sucesso = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleRegistrar(event: Event) {
    event.preventDefault();
    this.registrando = !this.registrando;
    this.erro = '';
    this.sucesso = '';
    this.nome = '';
    this.usuario = '';
    this.senha = '';
    this.confirmarSenha = '';
  }

  onSubmit() {
    this.erro = '';
    this.sucesso = '';
    if (this.registrando) {
      // Cadastro
      if (this.senha !== this.confirmarSenha) {
        this.erro = 'As senhas não coincidem!';
        return;
      }
      const novoUsuario = {
        nome: this.nome,
        usuario: this.usuario,
        senha: this.senha
      };
      this.authService.registrar(novoUsuario).subscribe({
        next: () => {
          this.sucesso = 'Conta criada com sucesso! Faça login.';
          setTimeout(() => {
            this.toggleRegistrar(new Event('click'));
          }, 2000);
        },
        error: (err) => {
          this.erro = 'Erro ao criar conta: ' + (err.error?.message || err.error || 'Tente outro usuário.');
        }
      });
    } else {
      
     // Login
this.authService.login(this.usuario, this.senha).subscribe({
  next: (resposta: any) => {
    console.log('Resposta do login:', resposta); 
    this.authService.salvarToken(resposta.token); 
    localStorage.setItem('idUsuario', resposta.id); 
    localStorage.setItem('tipo', resposta.tipo);   
    this.sucesso = 'Login realizado com sucesso!';
    setTimeout(() => {
      this.router.navigate(['/postagens']);
    }, 2000);
  },
  error: () => {
    this.erro = 'Usuário ou senha inválidos!';
  }
});
    }
  }
}