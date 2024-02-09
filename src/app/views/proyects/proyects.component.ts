import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, ViewChild} from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { TabsetComponent } from 'src/app/components/tabset/tabset.component';
import { DatatableComponent } from 'src/app/components/datatable/datatable.component';
import { FormDynamicComponent } from 'src/app/components/form-dynamic/form-dynamic.component';
import { FinanzasComponent } from './finanzas/finanzas.component';
import { Router } from '@angular/router';
import { GlobalUtil } from 'src/app/utils/global.util';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './proyects.component.html',
  styleUrls: ['./proyects.component.css']
})

export class ProyectsComponent implements OnInit{

  constructor(private _globalService: GlobalService, private router: Router, private _globalUtil: GlobalUtil){}

  public data_modal:any = {};
  public id_tarea:string = '';
  public color:any = {'': ''};
  public list_users:any[] = [];
  private copy_data:any[] = [];
  public loading:boolean = true;
  public data_estados:any[] = [];
  public inputs_tareas:any[] = [];
  public data_ciudades:any[] = [];
  public data_inventario:any[] = [];
  public inputs_avances:any[] = [];
  public data_tipo_tareas:any[] = [];
  public inputs_proyectos:any[] = [];
  public id_update_tareas:string = '';
  public update_state:boolean = false;
  public data_departamentos:any[] = [];
  public data_estados_tareas:any[] = [];
  public update_state_tareas:boolean = false;
  public close_loading = {count:0, request: 5}
  public data = new BehaviorSubject<any[]>([]);
  public data_avance:any = {id_tarea: "", id_avance: "", state_edit: false};
  public selectTypeProject: any = "1";

  @ViewChild('modal_form') modal_form:ModalComponent | null = null;
  @ViewChild('modal_info') modal_info:ModalComponent | null = null;
  @ViewChild('modal_tareas') modal_tareas:ModalComponent | null = null;
  @ViewChild('modal_avances') modal_avances:ModalComponent | null = null;
  @ViewChild('app_finanzas') app_finanzas:FinanzasComponent | null = null;
  @ViewChild('modal_finanzas') modal_finanzas:ModalComponent | null = null;
  @ViewChild('tabset_avances') tabset_avances:TabsetComponent | null = null;
  @ViewChild('alert_proyectos') alert_proyectos:AlertComponent | null = null;
  @ViewChild('modal_inventario') modal_inventario:ModalComponent | null = null;
  @ViewChild('datatable_avances') datatable_avances:DatatableComponent | null = null;
  @ViewChild('form_dynamic_tareas') form_dynamic_tareas:FormDynamicComponent | null = null;
  @ViewChild('form_dynamic_avance') form_dynamic_avance:FormDynamicComponent | null = null;
  @ViewChild('form_dynamic_proyecos') form_dynamic_proyecos:FormDynamicComponent | null = null;

  // ------------------------------------ GENERAL --------------------------------------- //

  public closeLoading(){
    this.close_loading.count++;
    if(this.close_loading.count == this.close_loading.request) this.loading = false;
  }

  // ------------------------------------ PROYECTOS --------------------------------------- //

  public open_modal(){
    this.data_modal = {};
    this.form_dynamic_proyecos?.form_group.reset();
    this.modal_form?.open_modal();
    this.form_dynamic_proyecos?.form_group.setControl('codigo_proyecto', new FormControl(this._globalUtil.generateRandomCode()));
  }

  public close_modal():void{
    this.update_state = false;
    console.log(this.update_state);
    this.modal_form?.close_modal();
    this.form_dynamic_proyecos?.form_group.reset();
  }

  public search_by({value}:any){
    this.data.next(
      this.copy_data.filter(item =>{
        return Object.values(item).some((item:any)=> typeof item == 'string' ? item.toUpperCase()?.includes(value.toUpperCase()) : false)
      })
    )
  }

  public open_info(proyect:any):void{
    this.data_modal = proyect;
    this.modal_info?.open_modal();
  }

  public handler_update_proyecto(data:any):void{
    this.data_modal = data;
    data.fec_inicio = data.fec_inicio.split(' ')[0];
    data.fec_fin_real = data.fec_fin_real ? data.fec_fin_real?.split(' ')[0] : null;
    data.fec_fin_estimado = data.fec_fin_estimado.split(' ')[0];    
    data.id_user = this.list_users.find(item => item.nombre_completo == data.nombre_completo )?.nombre_completo;
    
    let formGrup:any = this.form_dynamic_proyecos?.form_group;
    data.id_estado = this.data_estados.find(item => item.id == data.id_estado)?.nombre_estado;
    
    Object.keys(formGrup.controls ?? {}).map((key:any) =>{
      formGrup.controls[key].setValue(data[key]);
    });
    
    this.modal_form?.open_modal();
    this.update_state = true;
  }

  public create_proyectos(datos:any):void{
    let data = {
      ...datos,
      id: this.data_modal?.id ?? "",
      id_user: this.list_users.find(item => item.nombre_completo.toUpperCase() == datos.id_user.toUpperCase())?.id,
      id_estado: this.data_estados.find(item => item.nombre_estado == datos.id_estado)?.id,
    }

    if(data.id_user == undefined || !data.id_user){this.alert_proyectos?.open_alert('!Selecciona un usuario válido!'); return}
    else this.alert_proyectos?.close_alert(0);
  
    this.loading = true;
    this._globalService.post_service('/proyecto/insert_proyecto', data).subscribe({
      next: (response:any)=>{
        if(response.successful){
          let data:any[] = [];

          if(this.update_state){
            data = this.data.getValue().map(item => item.id == response.data[0].id ? this.transform_data(response.data[0]) : item)
          } else data = [this.transform_data(response.data[0]), ...this.data.getValue()]
          
          this.data.next(data);
          this.copy_data = data;
          this.app_finanzas?.setDatalistProyects(this.copy_data.map((item:any) => {return {codigo: item.codigo_proyecto, value: item.id, title: `${item.codigo_proyecto} - ${item.nombre_proyecto}`}}))
          this.alert_proyectos?.open_alert('¡Se ha realizado la acción con éxito!');
          this.close_modal();
        }
        else this.alert_proyectos?.open_alert(response.error ?? '¡Error al realizar la acción!')

        this.loading = false;
        this.alert_proyectos?.close_alert(10000);
      }
    })
  }

  public transform_data(item:any):any{
    item.tareas = [];
    item.porcentaje = `${Number(item.porcentaje)}%`;
    let fecha = new Date(item.fec_fin_estimado).getTime(),
    now_fecha = new Date().getTime();
    item.dias_restantes = Math.floor((fecha - now_fecha) / (1000 * 60 * 60 * 24));
    item.color = item.dias_restantes <= 0 ? 'red' : item.dias_restantes <= 3 ? 'orange': 'green';
    item.total = Number(item.pres_mano_obra) + Number(item.pres_materiales) + Number(item.pres_otros)

    return item
  }

  // ------------------------------------ TAREAS --------------------------------------- //

  public handler_update_tarea(data:any):void{
    this.update_state_tareas = true;
    this.id_tarea = data.id;

    data = {
      ...data,
      fec_fin: data.fec_fin.split(' ')[0],
      fec_inicio_: data.fec_inicio.split(' ')[0],
      id_user_tareas: this.list_users.find(user => user.id == data.id_user)?.nombre_completo,
      id_tarea_tipo: this.data_tipo_tareas.find(item => item.id == data.id_tarea_tipo)?.nombre_tarea,
      id_tarea_estado: this.data_estados_tareas.find(item => item.id == data.id_tarea_estado)?.nombre_estado_tarea,
    };
    
    let form:any = this.form_dynamic_tareas?.form_group.controls;
    Object.keys(form).map((key:string) =>{
      form[key].setValue(data[key])
    });

    this.modal_tareas?.open_modal();
  }

  public create_update_tareas(data:any){
    this.loading = true;

    let proyect = this.data.getValue().find(element => element.id == this.id_update_tareas)

    data = {
      ...data,
      id: this.id_tarea,
      fec_inicio: data.fec_inicio_,
      id_proyecto: proyect.id,
      id_user: this.list_users.find(item => item.nombre_completo.toUpperCase().trim() == data.id_user_tareas.toUpperCase().trim())?.id,
      id_tarea_tipo: this.data_tipo_tareas.find(item => item.nombre_tarea.toUpperCase() == data.id_tarea_tipo.toUpperCase())?.id,
      id_tarea_estado: this.data_estados_tareas.find(item => item.nombre_estado_tarea.toUpperCase() == data.id_tarea_estado.toUpperCase())?.id,
    }

    this._globalService.post_service('/tarea/insert_tarea', data).subscribe({
      next: (response:any)=>{
        if(response.successful){
          let new_data = response.data[0];
          new_data.porcentaje_number = Number(new_data.porcentaje);
          new_data.porcentaje = `${new_data.porcentaje_number >= 100 ? 100 : new_data.porcentaje_number}%`
          new_data.fec_fin = new_data.fec_fin.split(' ')[0];
          new_data.fec_inicio = new_data.fec_inicio.split(' ')[0];
          
          if(this.update_state_tareas){
            proyect.tareas = proyect.tareas.map((item:any) =>{
              return item.id == this.id_tarea ? new_data : item;
            });
          }else{
            proyect.tareas
            ? proyect?.tareas.push(new_data)
            : proyect.tareas = [new_data];
          }

          this.modal_tareas?.close_modal();
          this.update_state_tareas = false;
          this.form_dynamic_tareas?.form_group.reset();
          this.alert_proyectos?.open_alert('¡Se ha realizado la acción con éxito!');
        }else this.alert_proyectos?.open_alert(response.error ?? '¡Error al realizar la acción!');

        this.loading = false;
        this.alert_proyectos?.close_alert(10000);
      }
    });
  }

  public get_tareas(element:any, proyect:any){
    if(!element.classList.contains('scale-100')){
      this.loading = true;
      this.id_update_tareas = proyect.id;
      this._globalService.get_service(`/tarea/lista_tareas?id=${proyect.id}`).subscribe({
        next: (response:any)=>{
          element.classList.remove('absolute');
          element.classList.add('scale-100');
  
          if(response.successful) proyect.tareas = response.data.map((item:any) => {
            item.porcentaje_number = Number(item.porcentaje);
            item.porcentaje = `${item.porcentaje_number >= 100 ? 100 : item.porcentaje_number}%`;
            item.fec_inicio = item.fec_inicio.split(' ')[0];
            item.fec_fin = item.fec_fin ? item.fec_fin?.split(' ')[0] : null;
            return item
          });

          this.loading = false;
        }
      });
    }else{
      element.classList.add('absolute');
      element.classList.remove('scale-100');
    }
  }

  public open_tareas(){
    this.modal_tareas?.open_modal();
  }

  // ------------------------------------ AVANCES --------------------------------------- //

  public get_avances(id_tarea:string):void{
    this.loading = true;
    this._globalService.get_service(`/tarea/lista_tarea_avances?id=${id_tarea}`).subscribe({
      next: (response:any)=>{
        if(response.successful) {
          this.data_avance.id_tarea = id_tarea;
          this.modal_avances?.open_modal();
          this.datatable_avances?.renderData.next(response.data.map((item:any) => {item.createdAt = item.createdAt.split('T')[0]; return item}));
        }else this.datatable_avances?.renderData.next([]);
        this.loading = false;
      }
    });
  }

  public delete_avance({data}:any):void{
    this.loading = true;
    this._globalService.delete_service(`/tarea/delete_tarea_avance?id=${data.id}`).subscribe({
      next: (response:any)=>{
        if(response.successful){
          this.datatable_avances?.renderData.next(
            this.datatable_avances?.renderData.getValue().filter(item => item.id != data.id)
          );
          this.alert_proyectos?.open_alert('¡Se ha realizado la acción con éxito!');
        } else this.alert_proyectos?.open_alert(response.error ?? '¡Error al realizar la acción!');

        this.loading = false;
        this.alert_proyectos?.close_alert(10000);
      }
    })
  }

  public handler_update_avance({data}:any):void{
    this.data_avance.state_edit = true;
    this.data_avance.id_avance = data.id;

    this.form_dynamic_avance?.form_group.setValue({avance: data.avance});
    this.tabset_avances?.handler_change_tab('CREAR');
  }

  public create_avance({avance}:any):void{
    this.loading = true;

    let data = {
      avance,
      id: this.data_avance.id_avance,
      id_tarea: this.data_avance.id_tarea,
    }

    this._globalService.post_service('/tarea/insert_tarea_avance', data).subscribe({
      next: (response:any)=>{
        if(response.successful){
          let new_data = response.data;
          new_data.createdAt = new_data.createdAt.split('T')[0];

          this.data_avance.state_edit 
          ? this.datatable_avances?.renderData.next(this.datatable_avances.renderData.getValue().map(item => item.id == new_data.id ? new_data : item))
          : this.datatable_avances?.renderData.next([new_data, ...this.datatable_avances.renderData.getValue()])

          this.data_avance.id_avance = "";
          this.data_avance.state_edit = false;
          this.form_dynamic_avance?.form_group.reset();
          this.tabset_avances?.handler_change_tab('FILTRAR');
          this.alert_proyectos?.open_alert('¡Se ha realizado la acción con éxito!');
        } else this.alert_proyectos?.open_alert(response.error ?? '¡Error al realizar la acción!');

        this.alert_proyectos?.close_alert(10000);
        this.loading = false;
      }
    })
  }

  // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //
  public onSelectChange() {
    this._globalService.get_service('/proyecto/lista_proyectosxtipo?id='+this.selectTypeProject).subscribe({
      next: (response:any)=>{
        if(response.successful){
          this.copy_data = response.data.map((item:any) => this.transform_data(item)).sort((a:any, b:any) => a.dias_restantes - b.dias_restantes);
          this.data.next(this.copy_data);  
        }
        this.closeLoading();
      }
    });
  }
  // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //

  private get_services():void{

    // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //
    // this._globalService.get_service('/proyecto/lista_proyectos?id').subscribe({
    this._globalService.get_service('/proyecto/lista_proyectosxtipo?id='+this.selectTypeProject).subscribe({
    // --- CAMBIOS AGREGADOS - AUTOR: @JD13HR --- //

      next: (response:any)=>{
        if(response.successful){
          this.copy_data = response.data.map((item:any) => this.transform_data(item)).sort((a:any, b:any) => a.dias_restantes - b.dias_restantes);
          this.data.next(this.copy_data);  
        }
        this.closeLoading();
      }
    });

    this._globalService.get_service('/proyecto/lista_dpt_y_ciudades').subscribe({
      next: (response:any)=>{
        this.data_departamentos = response;
        this.data_ciudades = this.data_departamentos.map(item => item.ciudades).flat();
        this.closeLoading();
      }
    });

    this._globalService.get_service('/proyecto/lista_estados?id=').subscribe({
      next:(response:any)=>{
        this.data_estados = response.data;
        this.closeLoading();
      }
    });

    this._globalService.get_service('/tarea/lista_tarea_estados?id=').subscribe({
      next:(response:any)=>{
        this.data_estados_tareas = response.data;
        this.closeLoading();
      }
    });

    this._globalService.get_service('/tarea/lista_tipos_tarea?id=').subscribe({
      next:(response:any)=>{
        this.data_tipo_tareas = response.data;
        this.closeLoading();
      }
    });

    this._globalService.get_service('/user/lista_users?id=').subscribe({
      next: (response:any)=>{
        if(response.successful) this.list_users = response.data.filter((user:any) => user.rol_name == 'Colaborador');
      }
    });
  }

  // ------------------------------------ FINANZAS --------------------------------------- //

  public handler_open_finanzas(proyect:any):void{
    this.loading = true;
    this._globalService.get_service(`/finanzas/finanzas_proyecto?id=${proyect.id}`).subscribe({
      next:(response:any)=>{
        if(response.successful){
          this.modal_finanzas?.open_modal();
          this.app_finanzas?.open_proyecto(response.data);
        }else this.app_finanzas?.open_proyecto({material:[]});
        
        this.app_finanzas?.setDatalistProyects(
          this.copy_data.map((item:any) => {return {codigo: item.codigo_proyecto, value: item.id, title: `${item.codigo_proyecto} - ${item.nombre_proyecto}`}})
        );
        this.loading = false;
      }
    })
  }

  public handler_close_finanzas():void{
    this.modal_finanzas?.close_modal();
    // this.app_finanzas?.open_proyecto([]);
  }

  // ------------------------------------ INVENTARIO --------------------------------------- //
  
  public get_inventario_proyecto():void{
    this.loading = true;
    this._globalService.get_service('/inventario_material/lista_inventario_solicitud').subscribe({
      next: (response:any)=>{
        if(response.successful){
          this.data_inventario = response.data.map((item:any) => {
            item.materiales = item.materiales.map((material:any) =>{
              material.createdAt = material.createdAt?.split(' ')[0];
              return material
            })
            return item
          });

          this.modal_inventario?.open_modal();
        }

        this.loading = false;
      }
    })
  }

  // public handler_edit_inventario():void{
  //   this.router.navigate([`/despachos/:id`]);
  // }

  // ------------------------------------ OnInit --------------------------------------- //

  ngOnInit(): void {
    this.inputs_proyectos = [
      {
        title: 'DATOS BÁSICOS',
        // inputs: [
        //   {value: null, name: 'id_user', icon: 'cil-user', label: 'Usuario encargado', attributes: {type: 'text', list: 'datalist-usuarios'}, validators: ['required'],},
        //   {value: null, name: 'nombre_proyecto', icon: 'cil-notes', label: 'Nombre', attributes: {type: 'text'}, validators: ['required'],},
        //   {value: null, name: 'codigo_proyecto', icon: 'cil-barcode', label: 'Código', attributes: {type: 'text'}, validators: ['required'],},
        //   {value: null, name: 'id_estado', icon: 'cil-barcode', label: 'Estado', attributes: {type: 'text', list: 'datalist-estados'}, validators: ['required'],},
        //   {value: null, name: 'nombre_cliente', icon: 'cil-user', label: 'Cliente', attributes: {type: 'text'},validators: ['required'],},
        //   {value: null, name: 'telefono_cliente', icon: 'cil-phone', label: 'Teléfono', attributes: {type: 'text'}, validators: ['required'],},
        //   {value: null, name: 'pres_mano_obra', icon: 'cil-money', label: '$ Mano de obra', money:true, attributes: {type: 'text'}, validators: ['required'],},
        //   {value: null, name: 'pres_materiales', icon: 'cil-money', label: '$ Materiales', money:true, attributes: {type: 'text'}, validators: ['required'],},
        //   {value: null, name: 'pres_otros', icon: 'cil-money', label: '$ otros', money:true, attributes: {type: 'text'}, validators: ['required'],},
        //   {value: null, name: 'observacion', icon: 'cil-notes', label: 'Observacion', attributes: {type: 'text'}},
        // ]
        inputs: [
          {value: null, name: 'id_user', icon: 'cil-user', label: 'Usuario encargado', attributes: {type: 'text', list: 'datalist-usuarios'}, validators: ['required'],},
          {value: null, name: 'nombre_proyecto', icon: 'cil-notes', label: 'Nombre', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'codigo_proyecto', icon: 'cil-barcode', label: 'Código', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'id_estado', icon: 'cil-barcode', label: 'Estado', attributes: {type: 'text', list: 'datalist-estados'}, validators: ['required'],},
          {value: null, name: 'nombre_cliente', icon: 'cil-user', label: 'Cliente', attributes: {type: 'text'},validators: ['required'],},
          {value: null, name: 'telefono_cliente', icon: 'cil-phone', label: 'Teléfono', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'observacion', icon: 'cil-notes', label: 'Observacion', attributes: {type: 'text'}},
          {value: null, name: 'pres_mano_obra', icon: 'cil-money', label: '$ Mano de obra blanca', money:true, attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'pres_mano_obra', icon: 'cil-money', label: '$ Mano de obra carpinteria', money:true, attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'pres_materiales', icon: 'cil-money', label: '$ Materiales obra blanca', money:true, attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'pres_materiales', icon: 'cil-money', label: '$ Materiales carpinteria', money:true, attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'pres_otros', icon: 'cil-money', label: '$ otros', money:true, attributes: {type: 'text'}, validators: ['required'],},
        ]
      },
      {
        title: 'DATOS GEOGRÁFICOS',
        inputs: [
          {value: null, name: 'departamento', icon: 'cil-location-pin', label: 'Departamento', attributes: {type: 'text', list: 'datalist-departamentos'}, validators: ['required'],},
          {value: null, name: 'ciudad', icon: 'cil-factory', label: 'Ciudad', attributes: {type: 'text', list: 'datalist-ciudades'}, validators: ['required'],},
          {value: null, name: 'direccion', icon: 'cil-notes', label: 'Dirección', attributes: {type: 'text'}, validators: ['required'],},
        ]
      },
      {
        title: 'FECHAS',
        inputs: [
          {value: null, name: 'fec_inicio', icon: 'cil-calendar', label: 'Fecha Inicio', attributes: {type: 'date'}, validators: ['required'],},
          {value: null, name: 'fec_fin_estimado', icon: 'cil-calendar', label: 'Fecha Estimada', attributes: {type: 'date'}, validators: ['required'],},
          {value: null, name: 'fec_fin_real', icon: 'cil-calendar', label: 'Fecha Real', attributes: {type: 'date'}},
        ]
      },
    ];

    this.inputs_tareas = [
      {
        title: 'CREAR TAREA',
        description: 'Datos básicos de la tarea',
        inputs: [
          {value: null, name: 'id_user_tareas', icon: 'cil-user', label: 'Usuario encargado', attributes: {type: 'text', list: 'datalist-usuarios'}, validators: ['required'],},
          {value: null, name: 'descripccion', icon: 'cil-notes', label: 'Descripción', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'id_tarea_tipo', icon: 'cil-barcode', label: 'Tipo', attributes: {type: 'text', list: 'datalist-tipos-tareas'}, validators: ['required'],},
          {value: null, name: 'id_tarea_estado', icon: 'cil-user', label: 'Estado', attributes: {type: 'text', list: 'datalist-estados-tareas'},validators: ['required'],},
          {value: null, name: 'fec_inicio_', icon: 'cil-calendar', label: 'Fecha inicio', attributes: {type: 'date'}, validators: ['required'],},
          {value: null, name: 'fec_fin', icon: 'cil-calendar', label: 'Fecha fin', attributes: {type: 'date'}, validators: ['required'],},
        ]
      },
    ]

    this.inputs_avances = [
      {
        title: 'CREAR AVANCE',
        description: 'Descripción básica de el avance a presentar',
        inputs: [
          {value: null, name: 'avance', icon: 'cil-notes', label: 'Avance', attributes: {type: 'text'}, validators: ['required'],},
        ]
      },
    ];

    //-----------------------------------> SERVICIOS <---------------------------------- //

    this.get_services();
  }
}