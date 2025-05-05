import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TemaService } from '../../services/tema.service';
import { PostService } from '../../services/post.service';
import { Tema } from '../../models/tema.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PostComponent implements OnInit {
  filtro: string = '';
  postagens: any[] = [];
  postagensFiltradas: any[] = [];

  mostrarCriarPostagem = false;
  mostrarEditarPostagem = false;
  temas: Tema[] = [];
  novaPostagem = {
    tema: null as Tema | null,
    titulo: '',
    texto: ''
  };
  postagemEditando: any = null;

  erroCriar = false;
  mensagem: string = '';

  usuarioLogadoId: number = Number(localStorage.getItem('idUsuario'));
  usuarioLogadoTipo: string = localStorage.getItem('tipo') || '';

  // Variáveis para criar tema
  mostrarCriarTema = false;
  novoTema: Tema = { id: 0, descricao: '' };
  erroCriarTema = false;
  mensagemTema: string = '';

  constructor(
    private router: Router,
    private temaService: TemaService,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.temaService.getAll().subscribe({
      next: (data: Tema[]) => this.temas = data,
      error: (err) => console.error('Erro ao buscar temas:', err)
    });

    this.recarregarPostagens();
  }

  irParaDashboard() {
    this.router.navigate(['/dashboard']);
  }
  recarregarPostagens() {
    this.postService.getAll().subscribe({
      next: (data) => {
        this.postagens = data;
        this.filtrarPostagens();
      },
      error: (err) => console.error('Erro ao buscar postagens:', err)
    });
  }

  filtrarPostagens() {
    const f = this.filtro.trim().toLowerCase();
    if (!f) {
      this.postagensFiltradas = this.postagens;
      return;
    }
    this.postagensFiltradas = this.postagens.filter(p =>
      (p.usuario?.nome && p.usuario.nome.toLowerCase().includes(f)) ||
      (p.usuario?.usuario && p.usuario.usuario.toLowerCase().includes(f)) ||
      (p.titulo && p.titulo.toLowerCase().includes(f)) ||
      (p.texto && p.texto.toLowerCase().includes(f)) ||
      (p.data && new Date(p.data).toLocaleDateString('pt-BR').includes(f)) ||
      (p.tema?.descricao && p.tema.descricao.toLowerCase().includes(f))
    );
  }

  abrirCriarPostagem() {
    this.mostrarCriarPostagem = true;
    this.mostrarEditarPostagem = false;
    this.mensagem = '';
  }

  criarPostagem() {
    const idUsuario = localStorage.getItem('idUsuario');
    if (!this.novaPostagem.tema || !this.novaPostagem.titulo || !this.novaPostagem.texto || !idUsuario) {
      this.erroCriar = true;
      this.mensagem = 'Preencha todos os campos e selecione um tema.';
      return;
    }
    this.erroCriar = false;
    this.mensagem = '';
  
    // Mostra o tema selecionado no console
    console.log('Tema selecionado:', this.novaPostagem.tema);
  
    const postagemParaEnviar = {
      titulo: this.novaPostagem.titulo,
      texto: this.novaPostagem.texto,
      tema: { id: this.novaPostagem.tema.id },
      usuario: { id: Number(idUsuario) }
    };
  
    // Mostra o objeto que será enviado
    console.log('Postagem para enviar:', postagemParaEnviar);
  
    this.postService.criarPost(postagemParaEnviar).subscribe({
      next: () => {
        this.novaPostagem = { tema: null, titulo: '', texto: '' };
        this.recarregarPostagens();
        this.mostrarCriarPostagem = false;
        setTimeout(() => {
          this.mensagem = 'Postagem criada com sucesso!';
          setTimeout(() => this.mensagem = '', 3000);
        }, 0);
      },
      error: (err) => {
        this.mensagem = 'Erro ao criar postagem!';
        this.erroCriar = true;
        console.error('Erro ao criar postagem:', err);
      }
    });
  }

  // Permissões
  podeEditar(post: any): boolean {
    if (this.usuarioLogadoTipo === 'ROLE_ADMIN') return true;
    if (this.usuarioLogadoTipo === 'ROLE_USER' && post.usuario?.id === this.usuarioLogadoId) return true;
    return false;
  }

  podeExcluir(post: any): boolean {
    if (this.usuarioLogadoTipo === 'ROLE_ADMIN') return true;
    if (this.usuarioLogadoTipo === 'ROLE_USER' && post.usuario?.id === this.usuarioLogadoId) return true;
    return false;
  }

  soPodeEditarTema(): boolean {
    return this.usuarioLogadoTipo === 'ROLE_ADMIN' && this.postagemEditando && this.postagemEditando.usuario.id !== this.usuarioLogadoId;
  }

  // Edição
  editarPost(post: any) {
    this.postagemEditando = {
      ...post,
      tema: { ...post.tema },
      usuario: { ...post.usuario }
    };
    this.mostrarEditarPostagem = true;
    this.mostrarCriarPostagem = false;
    this.mensagem = '';
  }

  salvarEdicao() {
    if (
      !this.postagemEditando ||
      !this.postagemEditando.tema ||
      !this.postagemEditando.tema.id ||
      !this.postagemEditando.titulo ||
      !this.postagemEditando.texto ||
      this.postagemEditando.titulo.trim() === '' ||
      this.postagemEditando.texto.trim() === ''
    ) {
      this.mensagem = 'Preencha todos os campos e selecione um tema para editar.';
      return;
    }

    const postagemParaEnviar = {
      id: this.postagemEditando.id,
      titulo: this.postagemEditando.titulo,
      texto: this.postagemEditando.texto,
      tema: { id: this.postagemEditando.tema.id },
      usuario: { id: this.postagemEditando.usuario.id }
    };

    this.postService.editarPost(postagemParaEnviar).subscribe({
      next: () => {
        this.mostrarEditarPostagem = false;
        this.postagemEditando = null;
        this.recarregarPostagens();
        setTimeout(() => {
          this.mensagem = 'Postagem editada com sucesso!';
          setTimeout(() => this.mensagem = '', 3000);
        }, 0);
      },
      error: (err) => {
        this.mensagem = 'Erro ao editar postagem!';
        console.error('Erro ao editar postagem:', err);
      }
    });
  }

  cancelarEdicao() {
    this.mostrarEditarPostagem = false;
    this.postagemEditando = null;
  }

  // Exclusão
  excluirPost(post: any) {
    if (confirm('Tem certeza que deseja excluir esta postagem?')) {
      this.postService.excluirPost(post.id).subscribe({
        next: () => {
          this.recarregarPostagens();
          setTimeout(() => {
            this.mensagem = 'Postagem excluída com sucesso!';
            setTimeout(() => this.mensagem = '', 3000);
          }, 0);
        },
        error: (err) => {
          this.mensagem = 'Erro ao excluir postagem!';
          console.error('Erro ao excluir postagem:', err);
        }
      });
    }
  }

  // Criar tema
  abrirCriarTema() {
    this.mostrarCriarTema = true;
    this.novoTema = { id: 0, descricao: '' };
    this.mensagemTema = '';
    this.erroCriarTema = false;
  }

  criarTema() {
    if (!this.novoTema.descricao || this.novoTema.descricao.trim() === '') {
      this.erroCriarTema = true;
      this.mensagemTema = 'Preencha a descrição do tema.';
      return;
    }
    this.erroCriarTema = false;
    this.mensagemTema = '';

    this.temaService.criarTema({ descricao: this.novoTema.descricao }).subscribe({
      next: (temaCriado: Tema) => {
        this.temas.push(temaCriado);
        this.mostrarCriarTema = false;
        this.mensagem = 'Tema criado com sucesso!';
        setTimeout(() => this.mensagem = '', 3000);
      },
      error: (err: any) => {
        this.mensagemTema = 'Erro ao criar tema!';
        this.erroCriarTema = true;
        console.error('Erro ao criar tema:', err);
      }
    });
  }

  cancelarCriarTema() {
    this.mostrarCriarTema = false;
    this.novoTema = { id: 0, descricao: '' };
    this.mensagemTema = '';
    this.erroCriarTema = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('tipo');
    this.router.navigate(['/login']);
  }
}