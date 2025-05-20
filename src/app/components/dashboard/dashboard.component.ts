import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Chart, registerables } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  totalPostagens: number = 0;
  ultimasPostagens: any[] = [];
  postagensPorAutor: { [key: string]: number } = {};
  totalAutores: number = 0;
  pieChart: any;
  barChart: any;

  constructor(private postService: PostService, private router: Router) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.carregarDadosDashboard();
  }

  carregarDadosDashboard(): void {
    this.postService.getAll().subscribe(postagens => {
      this.totalPostagens = postagens.length;
      this.ultimasPostagens = this.getUltimasPostagens(postagens, 5);
      this.postagensPorAutor = this.agruparPostagensPorAutor(postagens);
      this.totalAutores = Object.keys(this.postagensPorAutor).length;
      setTimeout(() => {
        this.criarPieChart();
        this.criarBarChart();
      }, 0);
    });
  }

  getUltimasPostagens(postagens: any[], count: number): any[] {
    return [...postagens]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, count);
  }

  agruparPostagensPorAutor(postagens: any[]): { [key: string]: number } {
    return postagens.reduce((acc: { [key: string]: number }, post) => {
      const nome = post.usuario?.nome || post.usuario?.usuario || 'Desconhecido';
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {});
  }

  criarPieChart(): void {
    const ctx = document.getElementById('postsPieChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const autores = Object.keys(this.postagensPorAutor);
    const quantidades = autores.map(autor => this.postagensPorAutor[autor]);
    const cores = [
      '#00ff88', '#6c63ff', '#ffb347', '#ff6363', '#36a2eb', '#a259ff', '#f67280'
    ];

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: autores,
        datasets: [{
          data: quantidades,
          backgroundColor: cores,
          borderColor: '#1a1625',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#fff', font: { size: 14 } }
          }
        }
      }
    });
  }

  criarBarChart(): void {
    const ctx = document.getElementById('postsBarChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.barChart) {
      this.barChart.destroy();
    }

    const autores = Object.keys(this.postagensPorAutor);
    const quantidades = autores.map(autor => this.postagensPorAutor[autor]);
    const cores = [
      '#00ff88', '#6c63ff', '#ffb347', '#ff6363', '#36a2eb', '#a259ff', '#f67280'
    ];

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: autores,
        datasets: [{
          label: 'Postagens',
          data: quantidades,
          backgroundColor: cores,
          borderColor: '#1a1625',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#fff', stepSize: 1 },
            grid: { color: '#31294b' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: '#31294b' }
          }
        }
      }
    });
  }

  logout(): void {
 
    this.router.navigate(['/login']);
  }
}
