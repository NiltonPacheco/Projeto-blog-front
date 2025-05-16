import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tema } from '../../models/tema.model';
import { PostService } from '../../services/post.service';
import { TemaService } from '../../services/tema.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe]
})
export class PostComponent implements OnInit {
  filtro: string = '';
  postagens: any[] = []; // Lista original completa
  postagensFiltradas: any[] = []; // Lista após a aplicação do filtro

  // Variáveis de Paginação
  currentPage = 1;
  itemsPerPage = 5; // Define quantos posts por página
  paginatedPostagens: any[] = []; // Lista de posts para a página atual
  totalPages = 0;

  // Variável de Classificação (Sorting) - Uma única variável
   sortCriteria = 'data_desc';

  mostrarCriarPostagem = false;
  mostrarEditarPostagem = false;
  mostrarVisualizarPostagem = false;

  temas: Tema[] = [];
  novaPostagem = {
    tema: null as Tema | null,
    titulo: '',
    texto: ''
  };
  postagemEditando: any = null;
  postagemVisualizando: any = null;

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
        this.aplicarFiltroClassificacaoPaginacao(); // Atualiza tudo após carregar posts
      },
      error: (err) => console.error('Erro ao buscar postagens:', err)
    });
  }

  // Método principal que aplica filtro, classificação e paginação em sequência
  aplicarFiltroClassificacaoPaginacao() {
    this.aplicarFiltro();
    this.aplicarClassificacao(); // Aplica classificação APÓS o filtro
    this.updatePagination();     // Atualiza paginação APÓS classificação
  }

  // Aplica apenas o filtro
  aplicarFiltro() {
    const f = this.filtro.trim().toLowerCase();
    if (!f) {
      this.postagensFiltradas = [...this.postagens]; // Usa spread para criar uma nova array
    } else {
      this.postagensFiltradas = this.postagens.filter(p =>
        (p.usuario?.nome && p.usuario.nome.toLowerCase().includes(f)) ||
        (p.usuario?.usuario && p.usuario.usuario.toLowerCase().includes(f)) ||
        (p.titulo && p.titulo.toLowerCase().includes(f)) ||
        (p.texto && p.texto.toLowerCase().includes(f)) ||
        (p.data && new Date(p.data).toLocaleDateString('pt-BR').includes(f)) ||
        (p.tema?.descricao && p.tema.descricao.toLowerCase().includes(f))
      );
    }
     // Resetar a página atual para 1 após filtrar (antes de re-paginar)
     this.currentPage = 1;
  }

  // Aplica a classificação na lista filtrada com base no novo critério
  aplicarClassificacao() {
      const [field, direction] = this.sortCriteria.split('_');
      const isAsc = direction === 'asc';

      this.postagensFiltradas.sort((a, b) => {
          let valueA = this.getFieldValue(a, field);
          let valueB = this.getFieldValue(b, field);

          // Converte datas para Date objects para comparação correta
          if (field === 'data') {
              valueA = valueA ? new Date(valueA) : null;
              valueB = valueB ? new Date(valueB) : null;
          }

          let comparison = 0;

          // Lida com valores nulos/indefinidos para garantir ordenação consistente
          if (valueA == null && valueB == null) comparison = 0;
          else if (valueA == null) comparison = -1; // Nulls before non-nulls
          else if (valueB == null) comparison = 1;
          else if (typeof valueA === 'string' && typeof valueB === 'string') {
              comparison = valueA.localeCompare(valueB);
          } else { // Comparação genérica para outros tipos (números, datas)
              if (valueA < valueB) comparison = -1;
              else if (valueA > valueB) comparison = 1;
              else comparison = 0;
          }


          return isAsc ? comparison : comparison * -1;
      });
  }

   // Helper para obter valor de campos aninhados (ex: 'usuario.nome')
   getFieldValue(item: any, field: string): any {
       if (!item || !field) return null;
       const fields = field.split('.');
       let value = item;
       for (const f of fields) {
           if (value === null || value === undefined) return null; // Retorna null se algum nível for nulo
           value = value[f];
       }
       return value;
   }


  // Atualiza a lista paginada e calcula totalPages
  updatePagination() {
    this.totalPages = Math.ceil(this.postagensFiltradas.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    // Garante que endIndex não exceda o tamanho da lista filtrada
    this.paginatedPostagens = this.postagensFiltradas.slice(startIndex, Math.min(endIndex, this.postagensFiltradas.length));
  }

  // Muda para a próxima página
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Muda para a página anterior
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Vai para uma página específica (não usado no HTML atual, mas útil)
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // Chamado ao mudar o filtro (ainda dispara todo o processo)
  filtrarPostagens() {
    this.aplicarFiltroClassificacaoPaginacao();
  }

  // Chamado ao mudar a classificação
  onSortChange() {
      this.aplicarClassificacao(); // Classifica a lista filtrada
      this.currentPage = 1; // Volta para a primeira página
      this.updatePagination(); // Atualiza a lista paginada
  }


  abrirCriarPostagem() {
    this.fecharTodosModais();
    this.mostrarCriarPostagem = true;
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

    const postagemParaEnviar = {
      titulo: this.novaPostagem.titulo,
      texto: this.novaPostagem.texto,
      tema: { id: this.novaPostagem.tema.id },
      usuario: { id: Number(idUsuario) }
    };

    this.postService.criarPost(postagemParaEnviar).subscribe({
      next: () => {
        this.novaPostagem = { tema: null, titulo: '', texto: '' };
        this.recarregarPostagens(); // Isso vai chamar aplicarFiltroClassificacaoPaginacao
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

  // Permissões (Mantidas como estão)
  podeEditar(post: any): boolean {
    if (this.usuarioLogadoTipo === 'ROLE_ADMIN') return true;
    if (post.usuario?.id === this.usuarioLogadoId) return true;
    return false;
  }

  podeExcluir(post: any): boolean {
    if (this.usuarioLogadoTipo === 'ROLE_ADMIN') return true;
    if (post.usuario?.id === this.usuarioLogadoId) return true;
    return false;
  }

  soPodeEditarTema(): boolean {
     // Lógica mantida, mas pode ser simplificada se Autor (Nome) foi removido
     // return this.usuarioLogadoTipo === 'ROLE_ADMIN' && this.postagemEditando && this.postagemEditando.usuario.id !== this.usuarioLogadoId;
     // Se apenas o autor OU admin podem editar Título/Texto, e ADMIN pode mudar o tema de qualquer um:
     // A lógica atual no HTML [disabled]="soPodeEditarTema()" desabilita o Título/Texto SE FOR ADMIN E NÃO FOR O AUTOR.
     // Isso parece correto para permitir que o admin altere apenas o tema de posts que não são dele.
     // Mantendo a lógica como está.
     return this.usuarioLogadoTipo === 'ROLE_ADMIN' && this.postagemEditando && this.postagemEditando.usuario.id !== this.usuarioLogadoId;
  }

  // Edição (Modificado para fechar outros modais ao abrir)
  editarPost(post: any) {
    this.fecharTodosModais();
    this.postagemEditando = {
      ...post,
      tema: { ...post.tema },
      usuario: { ...post.usuario }
    };
    this.mostrarEditarPostagem = true;
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
        this.recarregarPostagens(); // Isso vai chamar aplicarFiltroClassificacaoPaginacao
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
          this.recarregarPostagens(); // Isso vai chamar aplicarFiltroClassificacaoPaginacao
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

  // Criar tema (Modificado para fechar outros modais ao abrir)
  abrirCriarTema() {
    this.fecharTodosModais();
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

  // --- Métodos para Visualizar Postagem ---

  visualizarPost(postagem: any): void {
    this.fecharTodosModais();
    this.postagemVisualizando = postagem;
    this.mostrarVisualizarPostagem = true;
  }

  fecharVisualizarPostagem(): void {
    this.mostrarVisualizarPostagem = false;
    this.postagemVisualizando = null; // Limpa a postagem ao fechar
  }

  // Método auxiliar para fechar todos os modais
  fecharTodosModais(): void {
      this.mostrarCriarPostagem = false;
      this.mostrarEditarPostagem = false;
      this.mostrarCriarTema = false;
      this.mostrarVisualizarPostagem = false;
  }
}
