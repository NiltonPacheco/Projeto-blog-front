import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemaService } from '../../services/tema.service';

@Component({
  selector: 'app-tema',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tema.component.html',
  styleUrls: ['./tema.component.scss']
})
export class TemaComponent implements OnInit {
  temas: any[] = [];

  constructor(private router: Router, private temaService: TemaService) {}

  ngOnInit() {
    this.temaService.getAll().subscribe({
      next: (data) => this.temas = data,
      error: (err) => console.error('Erro ao buscar temas:', err)
    });
  }
}