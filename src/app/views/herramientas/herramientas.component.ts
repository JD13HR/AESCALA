import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { DatatableComponent } from 'src/app/components/datatable/datatable.component';
import { FormDynamicComponent } from 'src/app/components/form-dynamic/form-dynamic.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { TabsetComponent } from 'src/app/components/tabset/tabset.component';
import { FormControl, Validators } from '@angular/forms';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { GlobalUtil } from 'src/app/utils/global.util';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.component.html',
  styleUrls: ['./herramientas.component.css']
})

export class HerramientasComponent implements OnInit {

  constructor(private _globalService: GlobalService, private _globalUtil: GlobalUtil){}

  public inputs:any[] = [];
  public tabset:string = 'FILTRAR';
  public data_modal:any = {};
  public list_users:any[] = [];
  public id_update:string = '';
  public loading:boolean = true;
  public state_edith:boolean = false;
  public inputs_prestamos:any[] = [];
  public closeLoading = {count_request: 0, total_request: 2};

  @ViewChild('form_dynamic') form_dynamic:FormDynamicComponent | null = null;
  @ViewChild('alert_herramientas') alert_herramientas:AlertComponent | null = null;
  @ViewChild('modal_herramientas') modal_herramientas:ModalComponent | null = null;
  @ViewChild('tabsetHerramientas') tabsetHerramientas:TabsetComponent | null = null;
  @ViewChild('datatablePrestamos') datatablePrestamos:DatatableComponent | null = null;
  @ViewChild('datatableHerramientas') datatableHerramientas:DatatableComponent | null = null;
  @ViewChild('form_dynamic_prestamos') form_dynamic_prestamos:FormDynamicComponent | null = null;

  public scrollTo(id:string){
    setTimeout(() => {
      document.querySelector('main')?.scroll({top: document.getElementById(id)?.offsetTop ?? 0 + 100, behavior: 'smooth'});
    }, 0);
  }

  public create_or_update($event:any):void{
    this.loading = true;
    
    this._globalService.post_service('/herramienta/insert_herramienta', {...$event, id: this.state_edith ? this.id_update : "" }).subscribe((response:any) => {
      if(response.successful){
        if(this.state_edith){
          this.datatableHerramientas?.renderData?.next(
            this.datatableHerramientas?.renderData?.getValue().map(element=> element.id == this.id_update ? response.data[0] : element)
          );
        }else this.datatableHerramientas?.renderData?.next([...response.data, ...this.datatableHerramientas?.renderData?.getValue() ?? []]);

        this.alert_herramientas?.open_alert('¡Se ha realizado la operación con éxito!');
        this.form_dynamic?.form_group.reset();
        this.handler_reset();
      }else {
        this.alert_herramientas?.open_alert(response.error ?? '¡Ingresa los valores correctamente!');
      }
      
      this.loading = false;
      // this.state_edith = false;
      this.alert_herramientas?.close_alert(10000);
    });
  }

  public create_prestamo(data:any){
    this.loading = true;

    let body:any = {
      id: '',
      ...data,
      id_herramienta: this.data_modal?.id,
      id_user: this.list_users.find(item => item.nombre_completo.toUpperCase() == data.id_user)?.id
    }

    this._globalService.post_service('/herramienta/insert_prestamo', body).subscribe({
      next: (response:any)=>{
        if(response.successful){
          let new_response = response.data[0];
          new_response.fec_prestamo = new_response.fec_prestamo.split(' ')[0]
          let formulario:any = this.form_dynamic_prestamos?.form_group.controls;

          if(formulario['id']){
            let new_data:any[] = this.datatablePrestamos?.renderData.getValue().map(item => new_response.id == item.id ? new_response : item) ?? [];
            this.datatablePrestamos?.renderData.next(new_data);
            this.datatableHerramientas?.renderData.next(
              this.datatableHerramientas?.renderData.getValue().map(item => {
                if(item.id == this.data_modal.id) {
                  item.prestamos = new_data;
                  item.estado_prestado = new_response.tipo_prestamo == "Prestamo" ? "Prestado" : "Libre";
                  item.prestatario = new_response.tipo_prestamo == "Prestamo" ? new_response.nombre_completo : '';
                }
                return item
              })
            );
          } else {
            this.data_modal.prestamos 
            ? this.data_modal.prestamos.unshift(new_response)
            : this.data_modal.prestamos = [new_response];

            this.data_modal.estado_prestado = new_response.tipo_prestamo == "Prestamo" ? "Prestado" : "Libre";
            this.data_modal.prestatario = new_response.tipo_prestamo == "Prestamo" ? new_response.nombre_completo : '';

            this.datatablePrestamos?.renderData.next(this.data_modal.prestamos)
          }
          
          this.tabsetHerramientas?.handler_change_tab('FILTRAR');
          this.form_dynamic_prestamos?.form_group.reset();
          this.alert_herramientas?.open_alert(response.message ?? '¡Se realizó la acción correctamente!');

        }else this.alert_herramientas?.open_alert(response.error ?? '¡Error al realizar la acción!');

        this.alert_herramientas?.close_alert(10000);
        this.loading = false;
      }
    });
  }

  public load_update(data:any):void{
    Object.entries(this.form_dynamic?.form_group.controls ?? []).map(([key, value]:[string, any])=>{
      value.setValue(data[key])
    });

    this.scrollTo('toltipo-info');
    this.id_update = data.id;
    this.state_edith = true;
  }

  public handler_reset():any{
    this.state_edith = false;
    let controls:any = this.form_dynamic?.form_group.controls
    controls['codigo'].setValue(this._globalUtil.generateRandomCode())
  }

  public delete():void{
    this._globalService.post_service('', {}).subscribe((response:any) =>{
      if(response.successful){
        
      }
    });
  }

  public open_modal(data:any){
    this.data_modal = data;
    this.state_edith = false;
    this.modal_herramientas?.open_modal();
    this.datatablePrestamos?.renderData.next(data.prestamos);
    this.form_dynamic?.form_group.reset();
  }

  public load_update_prestamo({data}:any):void{
    this.tabsetHerramientas?.handler_change_tab('CREAR');
    let formulario:any = this.form_dynamic_prestamos?.form_group.controls;
    Object.keys(formulario).map((key:string) => formulario[key].setValue(data[key]));
    this.form_dynamic_prestamos?.form_group.setControl('id', new FormControl(data.id, Validators.required));

    formulario['id_user'].setValue(this.list_users.find(item => item.id == data.id_user)?.nombre_completo.toUpperCase());
  }

  public close_modal(){
    this.modal_herramientas?.close_modal();
  }

  ngOnInit(): void {
    this.inputs = [
      {
        title: 'DATOS BÁSICOS',
        description: 'Información básica del activo a registrar',
        inputs: [
          {value: null, name: 'nombre_herramienta', icon: 'cil-baseball', label: 'Herramienta', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'referencia', icon: 'cil-barcode', label: 'Referencia', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'marca', icon: 'cil-barcode', label: 'Marca', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'estado', icon: 'cil-notes', label: 'Estado', attributes: {type: 'text', list: 'datalist_estados'}, validators: ['required'],},
          {value: this._globalUtil.generateRandomCode(), name: 'codigo', icon: 'cil-notes', label: 'Código', attributes: {type: 'text'}, validators: ['required'],},
          {value: null, name: 'observacion', icon: 'cil-notes', label: 'Observación', attributes: {type: 'text'}, validators: ['required'],},
        ]
      },
    ];

    this.inputs_prestamos = [
      {
        title: 'PRESTAMOS',
        description: 'Datos básicos del prestamo',
        inputs: [
          {value: null, name: 'id_user', icon: 'cil-user', label: 'Colaborador (prestatario)', attributes: {type: 'text', list: 'datalist_user'}, validators: ['required']},
          {value: null, name: 'tipo_prestamo', icon: 'cil-color-border', label: 'Tipo', attributes: {type: 'text', list: 'datalist_tipo_prestamo'}, validators: ['required']},
          {value: null, name: 'observacion', icon: 'cil-notes', label: 'Observación', attributes: {type: 'text'}, validators: ['required']},
          {value: null, name: 'fec_prestamo', icon: 'cil-calendar', label: 'Fecha del prestamo', attributes: {type: 'date'}, validators: ['required']},
        ]
      },
    ];

    this._globalService.get_service('/herramienta/lista_herramientas').subscribe((response:any)=>{
      if(response.successful){
        this.datatableHerramientas?.renderData?.next(response.data.map((item:any) =>{
          item.prestamos.forEach((prestamo:any) => {
            prestamo.fec_prestamo = prestamo.fec_prestamo.split(' ')[0]
          });

          if(item.prestamos.length >= 1){
            const ultimoPrestamo = item.prestamos[0];
            item.estado_prestado = ultimoPrestamo.tipo_prestamo == "Prestamo" ? "Prestado" : "Libre";
            item.prestatario = ultimoPrestamo.tipo_prestamo == "Prestamo" ? ultimoPrestamo.nombre_completo : '';
          }else item.estado_prestado = 'Libre';
          
          return item
        }));
      }
      this.loading = false;
    });

    this._globalService.get_service('/user/lista_users?id=').subscribe({
      next: (response:any)=>{
        if(response.successful) this.list_users = response.data.filter((user:any) => user.rol_name == 'Colaborador');
      }
    });
  }
}