import { Router } from '@angular/router';
import { Injectable } from "@angular/core";
import { Component, OnInit, ViewChild} from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { NavUtil } from 'src/app/utils/nav.util';

export {};
declare var window: Window;
declare global {
  interface Window {
    process: any;
    require: any;
  }
}

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

@Injectable({
  providedIn: "root"
})

export class LoginComponent implements OnInit {
  constructor(private router:Router, private _globalService: GlobalService, private _navUtil: NavUtil){
  }
  
  public loading = false;
  // private _ipcRenderer:typeof ipcRenderer|null = null;
  @ViewChild('alert_users') alert_users:AlertComponent | null = null;

  public formulario = new FormGroup({
    'pass' : new FormControl('', [Validators.required]),
    'correo' : new FormControl('',[Validators.required, Validators.email])
  })

  public login():void{

    if(this.formulario.invalid){
      this.alert_users?.open_alert('¡Ingrese sus credenciales correctamente!');
      this.alert_users?.close_alert(10000);

      return
    }

    this.loading = true;
    this._globalService.post_service('/loguin', this.formulario.value).subscribe({
      next: (response:any)=>{
        if(response.successful){
          const dataUser = response.data.user
          localStorage.setItem('user', JSON.stringify(dataUser));

          this._navUtil.navItems.next(
            dataUser.rol_name == 'Usuario'  
            ? [
              {icon: 'cil-truck', title: 'Despachos', notifications: 0, url: '/despachos'},
              {icon: 'cil-book', title: 'Inventario', notifications: 0, url: '/inventario'},
              {icon: 'cil-baseball', title: 'Herramientas', notifications: 0, url: '/herramientas'},
              {icon: 'cil-laptop', title: 'Proyectos', notifications: 0, url: '/proyects'},
            ]
            : [
              {icon: 'cil-home', title: 'Inicio', notifications: false, url: '/home'},
              {icon: 'cil-people', title: 'Usuarios', notifications: false, url: '/users'},
              {icon: 'cil-laptop', title: 'Proyectos', notifications: 0, url: '/proyects'},
              {icon: 'cil-truck', title: 'Despachos', notifications: 0, url: '/despachos'},
              {icon: 'cil-book', title: 'Inventario', notifications: 0, url: '/inventario'},
              {icon: 'cil-baseball', title: 'Herramientas', notifications: 0, url: '/herramientas'},
            ]
          )
          localStorage.setItem('token', response.data.token);
          this.router.navigate(['/home']);
          // this.router.navigate(['/inventario']);   
        }else{
            this.alert_users?.open_alert(response.error ?? '¡Ingresa las credenciales correctamente!');
          this.alert_users?.close_alert(10000);
        }
        this.loading = false;
      },
      error: (error)=>{
        this.alert_users?.open_alert('¡Falló la autenticación del usuario! Intentando nuevamente...');
        this.alert_users?.close_alert(4000);

        this.loading = false;
        setTimeout(() => {this.login();}, 4000);
      }
    });

  }

  ngOnInit(): void {
    // this._ipcRenderer?.emit('os-storage-comunication', 'Desde el front mi papacho');
    // this._ipcRenderer = window?.require("electron").ipcRenderer;
    
    // this._ipcRenderer?.on('os-storage-comunication', (message:any)=>{
    //   this.alert_users?.open_alert('¡Servidor conectado correctamente!');
    //   this.alert_users?.close_alert(5000);
    //   console.log(message);
    // });

    // if (window.require) {
    //   try {
    //     this.ipc = window.require("electron").ipcRenderer;
    //   } catch (e) {
    //     throw e;
    //   }
    // } else {
    //   console.warn("Electron IPC was not loaded");
    // }
  }
}
