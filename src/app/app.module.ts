import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { IdentityGuard } from './services/identity.guard';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { UsersComponent } from './views/users/users.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from './containers/layout/layout.component';
import { LoadingComponent } from './components/loading/loading.component';
import { DatatableComponent } from './components/datatable/datatable.component';
import { IconModule, IconSetModule, IconSetService } from '@coreui/icons-angular';
import { FormDynamicComponent } from './components/form-dynamic/form-dynamic.component';
import { ProyectsComponent } from './views/proyects/proyects.component';
import { InventarioComponent } from './views/inventario/inventario.component';
import { HerramientasComponent } from './views/herramientas/herramientas.component';
import { ModalComponent } from './components/modal/modal.component';
import { TabsetComponent } from './components/tabset/tabset.component';
import { AlertComponent } from './components/alert/alert.component';
import { DespachosComponent } from './views/despachos/despachos.component';
import { FinanzasComponent } from './views/proyects/finanzas/finanzas.component';
import { ThousandsPipe } from './pipes/thousands.pipe';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HomeComponent,
    UsersComponent,
    DatatableComponent,
    LoadingComponent,
    FormDynamicComponent,
    ProyectsComponent,
    InventarioComponent,
    HerramientasComponent,
    ModalComponent,
    TabsetComponent,
    AlertComponent,
    DespachosComponent,
    FinanzasComponent,
    ThousandsPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    IconModule, IconSetModule,
  ],
  providers: [
    IdentityGuard, 
    IconSetService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
