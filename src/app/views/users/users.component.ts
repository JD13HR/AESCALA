import { Component, Input, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { DatatableComponent } from 'src/app/components/datatable/datatable.component';
import { FormDynamicComponent } from 'src/app/components/form-dynamic/form-dynamic.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { GlobalService } from 'src/app/services/global.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit{

  constructor(private _globalService: GlobalService){}

  public inputs:any[] = [];
  public state_edith = false;
  public loading:boolean = true;
  public alert:string|null = null;
  public datalistRoles:any[] = [];
  public message_server:string = '';
  public id_update:string|null = '';

  // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //
  public keys:any[] = ['nombre_completo', 'cedula', 'things','correo', 'telefono', 'direccion', 'rol_name', 'activo'];
  public titles:any[string] = ['nombre', 'cédula', 'proyectos', 'correo', 'teléfono', 'dirección', 'rol', 'activo', 'opciones'];
  public buttons:any[] = [{icon: 'cil-pencil', text: '', id: 2}];
  @Output() clickEmit = new EventEmitter<any>();
  public search_input:string = '';
  public renderDataTable:any[] = [];
  // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //
  
  @ViewChild('modalUsers') modalUsers:ModalComponent | null = null;
  @ViewChild('alert_users') alert_users:AlertComponent | null = null;
  @ViewChild('form_dynamic') form_dynamic:FormDynamicComponent | null = null
  @ViewChild('datatableUsers') datatableUsers:DatatableComponent | null = null

  public output_click(event:any):void{
    this.clickEmit.emit(event);
  }

  public handlerEdith({data}:any):void{
    this.state_edith = true;
    let {correo,cedula,rol_name,telefono,direccion,nombre_completo} = data;

    this.form_dynamic?.form_group.setValue({
      pass: null, correo, cedula, id_rol: rol_name, telefono, direccion, nombre_completo, activo: data.activo == 'Sí' ? true : false
    });

    this.id_update = data.id;
    this.scrollTo();
    document.getElementById('nombre_completo')?.focus();
  }

  public open_modal_error(response:any){
    this.message_server = response.error ? response.error : response.errors.map((element:any) => element.msg).join(', ');
    this.modalUsers?.open_modal();
  }

  public createUpdateUser($event:any):void{    
    this.loading = true;
    let activo:any = document.getElementById('activo');

    this._globalService.post_service('/user/insert_user', {...$event, id: this.id_update, id_rol: this.datalistRoles.find(item => item.rol_name.toUpperCase() == $event.id_rol.toUpperCase())?.id, activo: Number(activo.checked)}).subscribe({
      next: (response:any)=>{        
        if(response.successful){
          this.id_update = '';
          this.form_dynamic?.form_group.reset();

          if(this.state_edith){
            this.datatableUsers?.renderData.next(
              this.datatableUsers?.renderData.getValue().map((item:any)=>{
                if(item.id == response.data[0].id){
                  let result =  {...response.data[0], activo: response.data[0].activo ? 'Sí' : 'No'};
                  return result;
                }else return item
              })
            );
          }else{
            response.data[0].activo = response.data[0].activo ? 'Sí' : 'No';
            this.datatableUsers?.renderData.next([response.data[0], ...this.datatableUsers?.renderData.getValue()]);
          } 
          
          this.alert_users?.open_alert('¡Se realizó la acción correctamente!');
          this.state_edith = false;
        }else this.alert_users?.open_alert(response.error ?? '¡Error al realizar la acción!');

        this.loading = false;
        this.alert_users?.close_alert(10000);
      },
      error: (error)=>{
        this.modalUsers?.open_modal();
        this.message_server = error.error;
      }
    });
  }

  public scrollTo(id:string = 'top'):void{
    const scrollTo = id != 'top' ? document.getElementById(id)?.offsetTop : 0
    const scroll = document.getElementById('main');

    setTimeout(() => {
      scroll?.scroll({
        top: scrollTo,
        behavior: 'smooth',
      })
    }, 0);
  }

  ngOnInit(): void {
    this.inputs = [
      {
        title: 'DATOS BÁSICOS',
        description: 'Información personal del usuario',
        inputs: [
          {value: null, name: 'nombre_completo', icon: 'cil-user', label: 'Nombre', validators: ['required'], attributes: {type: 'text'}},
          {value: null, name: 'cedula', icon: 'cil-barcode', label: 'Cédula', validators: ['required'], attributes: {type: 'number'}},
          {value: null, name: 'telefono', icon: 'cil-phone', label: 'Teléfono', validators: ['required'], attributes: {type: 'number'}},
          {value: null, name: 'direccion', icon: 'cil-location-pin', label: 'Dirección', validators: ['required'], attributes: {type: 'text'}},
        ]
      },
      {
        title: 'CREDENCIALES',
        description: 'Datos de acceso a la plataforma',
        inputs: [
          {value: null, name: 'correo',   icon: 'cil-envelope-open', label: 'Correo', validators: ['required', 'email'], attributes: {type: 'text', required: true}},
          {value: null, name: 'pass', icon: 'cil-lock-locked', label: 'Contraseña', attributes: {type: 'password'}},
          {value: null, name: 'id_rol', icon: 'cil-user', label: 'Rol', attributes: {type: 'text', list: 'datalistRoles'}, validators: ['required']},
          {value: true, name: 'activo', icon: 'cil-user', label: 'activo', attributes: {type: 'checkbox'}},
        ]
      }
    ];

    this._globalService.get_service('/user/lista_roles?id=').subscribe({
      next: (response:any)=>{
        if(response.successful)this.datalistRoles = response.data;
      }
    });

    this._globalService.get_service('/user/lista_users?id=').subscribe({
      next: (response:any)=>{
        if(response.successful){        

          // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //  
          this.renderDataTable = response.data.map((item:any) => {
            item.things = item.ocupado_en.map((things: any) => things.ocupado_en);
            item.activo = Boolean(item.activo) ? 'Sí' : 'No';
            return item
          });          
          // this.datatableUsers?.renderData?.next(
          //   this.renderDataTable = response.data.map((item:any) => {
          //     //item.things = item.ocupado_en.map((things: any) => '<pre>'+things.ocupado_en+'</pre>');
          //     item.activo = Boolean(item.activo) ? 'Sí' : 'No';
          //     return item
          //   })
          // );
          // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //

        }
        this.loading = false;
      },
      error: (error)=>{
        this.datatableUsers?.renderData?.next([])
        this.loading = false;
      }
    });

  }
}
