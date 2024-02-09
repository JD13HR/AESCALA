import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentityGuard } from './services/identity.guard';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { LayoutComponent } from './containers/layout/layout.component';
import { UsersComponent } from './views/users/users.component';
import { ProyectsComponent } from './views/proyects/proyects.component';
import { InventarioComponent } from './views/inventario/inventario.component';
import { HerramientasComponent } from './views/herramientas/herramientas.component';
import { DespachosComponent } from './views/despachos/despachos.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  // { path: '404', component: P404Component, data: { title: 'Page 404' } },
  // { path: '500', component: P500Component, data: { title: 'Page 500' } },
  // canActivate: [LoginGuard]
  { path: 'login', component: LoginComponent, data: { title: 'Login Page' }},
  { path: '', component: LayoutComponent, data: { title: '' }, canActivate: [IdentityGuard],
    children: [
      { path: 'home',component: HomeComponent, data: { title: 'Inicio' } },
      { path: 'users',component: UsersComponent, data: { title: 'Usuarios' } },
      { path: 'inventario',component: InventarioComponent, data: { title: 'Inventario' } },
      { path: 'herramientas',component: HerramientasComponent, data: { title: 'Herramientas' } },
      { path: 'proyects',component: ProyectsComponent, data: { title: 'Proyectos' } },
      { path: 'despachos',component: DespachosComponent, data: { title: 'Despachos' } },
      { path: 'despachos/:id',component: DespachosComponent, data: { title: 'Despachos' } },
     ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
