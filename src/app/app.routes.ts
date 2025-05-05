import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PostComponent } from './components/post/post.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'; 

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'postagens', component: PostComponent },
  { path: 'dashboard', component: DashboardComponent }, 
  
];