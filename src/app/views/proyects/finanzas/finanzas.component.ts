import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { DatatableComponent } from 'src/app/components/datatable/datatable.component';
import { FormDynamicComponent } from 'src/app/components/form-dynamic/form-dynamic.component';
import { TabsetComponent } from 'src/app/components/tabset/tabset.component';

@Component({
  selector: 'app-finanzas',
  templateUrl: './finanzas.component.html',
  styleUrls: ['./finanzas.component.css']
})

export class FinanzasComponent {
  constructor(private _globalService: GlobalService){};

  public loading:boolean = false;
  public data_cotizacion:any = {};
  public data_finanzas:any = {};
  public id_cotizacion:string = '';
  public update_state:boolean = false;
  public proyecto:any = {material:[]};
  public datalist_inventario:any[] = [];
  @Input() datalist_proyects:any[] = [];
  public state_edith_cotizaciones:boolean = false;
  @Output() closeModal = new EventEmitter<any>();
  public closeLoading = {count_request: 0, total_request: 2};
  @ViewChild('alert_finanzas') alert_finanzas:AlertComponent | null = null;
  @ViewChild('tabset_ingreso_egreso') tabset_finanzas:TabsetComponent | null = null;
  @ViewChild('tabset_cotizaciones') tabset_cotizaciones:TabsetComponent | null = null;
  @ViewChild('datatable_finanzas') datatable_finanzas:DatatableComponent | null = null;
  @ViewChild('datatable_comparativo') datatable_comparativo:DatatableComponent | null = null;
  @ViewChild('form_dynamic_finanzas') form_dynamic_finanzas:FormDynamicComponent | null = null;
  @ViewChild('datatable_cotizaciones') datatable_cotizaciones:DatatableComponent | null = null;
  @ViewChild('form_dynamic_cotizaciones') form_dynamic_cotizaciones:FormDynamicComponent | null = null;

  public inputs_finanzas = [
    {
      title: 'CREAR COTIZACIÓN',
      inputs: [
        {value: null, name: 'tipo', icon: 'cil-puzzle', label: 'Tipo', attributes: {type: 'text', list: 'datalist_tipo_finanzas'}, validators: ['required']},
        {value: null, name: 'concepto', icon: 'cil-notes', label: 'Concepto', attributes: {type: 'text'}, validators: ['required'],},
        {value: null, name: 'valor', icon: 'cil-money', label: 'Valor', attributes: {type: 'text'}, money: true,},
      ]
    },
  ];

  public inputs_cotizaciones = [
    {
      title: 'CREAR COTIZACIÓN',
      description: 'Ingresa un cotización a un proyecto seleccionado',
      inputs: [
        {value: null, name: 'id_inventario', icon: 'cil-notes', label: 'Inventario', attributes: {type: 'text', list: 'datalist_inventario'}, validators: ['required'],},
        {value: null, name: 'id_proyecto', icon: 'cil-factory', label: 'Proyecto', attributes: {type: 'text',  list: 'datalist_proyects'}, validators: ['required']},
        {value: null, name: 'cantidad', icon: 'cil-money', label: 'Cantidad', money: true, attributes: {type: 'text'}, validators: ['required'],},
        {value: null, name: 'valor_unidad', icon: 'cil-money', label: 'Valor (und)', money: true, attributes: {type: 'text'}, validators: ['required'],},
      ]
    }
  ]

  public open_proyecto(proyecto:any):any{

    console.log('hola',proyecto);

    let total_actual_material = proyecto?.material[0]?.valor - proyecto?.material[1]?.valor,
    {pres_materiales, pres_otros, pres_mano_obra} = proyecto.proyecto[0];

    this.proyecto = {
      ...proyecto,
      pres_otros,
      total_actual_material, 
      pres_mano_obra,
      pres_materiales,
      total: pres_materiales + pres_mano_obra + pres_otros,
      total_materiales: total_actual_material < 0 ? pres_materiales + total_actual_material: pres_materiales - total_actual_material
    };

    this.datatable_finanzas?.renderData.next(proyecto?.finanzas?.map((item:any)=> this.format_element(item)));
    this.get_services();
    this.calcular_finanzas();
  };

  public getComparativo(event:string):void{
    if(event.trim() == "COMPARATIVO"){
      this.loading = true;
      this._globalService.get_service(`/cotizacion/comparativo_cotixentregas?id=${this.proyecto.id}`).subscribe({
        next: (response:any)=>{
          this.datatable_comparativo?.renderData.next(response.data.map((item:any) => {
            item.cant_despachos = Number(item.cant_despachos);
            item.cant_cotizacion = Number(item.cant_cotizacion);
            item.styleClassTr = item.cant_despachos >= item.cant_cotizacion ? 'bg-orange-200' : '';
            return item;
          }));
          this.loading = false;
        }
      })
    }
  }

  public calcular_finanzas():void{
    let types:any = {
      "Gasto": {
        "Gasto": 0,
        "values": []
      },
      "Ingreso":{
        "Ingreso": 0,
        "values": []
      }
    };

    let value = this.datatable_finanzas?.renderData.getValue() ?? [];
    value.forEach((item:any) => {
      types[item.tipo][item.tipo] += item.valor
      types[item.tipo].values.push(item);
    });

    this.data_finanzas = types;
    
    let {pres_otros, pres_mano_obra} = this.proyecto,
    total_proyecto_finanzas = pres_otros + pres_mano_obra,
    total_actual_finanzas = this.data_finanzas.Ingreso.Ingreso - this.data_finanzas.Gasto.Gasto;

    this.proyecto = {
      ...this.proyecto,
      total_actual_finanzas,
      total_proyecto_finanzas,
      total_finanzas: total_actual_finanzas < 0 ? total_proyecto_finanzas + total_actual_finanzas: total_proyecto_finanzas - total_actual_finanzas,
    }
  }

  public validateChangeTabEstado(tab:string):void{
    if(tab.trim() == 'ESTADO DEL PROYECTO'){
      this.calcular_finanzas();
    } 
  }

  public handler_reset():void{
    this.id_cotizacion = '';
    this.state_edith_cotizaciones = false;
    this.form_dynamic_cotizaciones?.form_group.reset();
  }

  public format_element(item:any):any{
    item.createdAt = item?.createdAt?.split('T')[0];
    return item
  };

  public handler_delete_cotizacion(cotizacion:any):void{
    this.loading = true;
    this._globalService.delete_service(`/finanzas/delete_finanza?id=${cotizacion.id}`).subscribe({
      next:(response:any)=>{
        if(response.successful){
          this.datatable_finanzas?.renderData.next(
            this.datatable_finanzas?.renderData.getValue().filter(item =>{
              return item.id != cotizacion.id
            })
          );

          this.alert_finanzas?.open_alert('¡Se ha realizado la acción con éxito!');
        }else this.alert_finanzas?.open_alert(response.error ?? '¡Error al realizar la acción!');

        this.alert_finanzas?.close_alert(10000);
        this.loading = false;
      }
    })
  }

  public handler_update_cotizacion(cotizacion:any):void{
    this.update_state = true;
    this.data_cotizacion = cotizacion;
    let {concepto, tipo, valor} = cotizacion;

    this.tabset_finanzas?.handler_change_tab('CREAR INGRESO | EGRESO');
    this.form_dynamic_finanzas?.form_group.setValue({concepto, tipo, valor});
  }

  public create_update_cotizacion(values:any):any{
    this.loading = true;   

    let body= {
      ...values,
      id_proyecto: this.proyecto.id,
      id: this.data_cotizacion.id ?? '',
    };
  
    this._globalService.post_service('/finanzas/insert_finanza', body).subscribe({
      next: (response:any)=>{        
        if(response.successful){
          if(this.update_state){
            this.datatable_finanzas?.renderData.next(
              this.datatable_finanzas?.renderData.getValue().map(item => item.id == response.data[0].id ? this.format_element(response.data[0]) : item)
            );
          }else{
            this.datatable_finanzas?.renderData.next([
              this.format_element(response.data[0]),
              ...this.datatable_finanzas?.renderData.getValue()
            ]);
          }

          this.update_state = false;
          this.form_dynamic_finanzas?.form_group.reset();
          this.tabset_finanzas?.handler_change_tab('LISTAR FINANZAS');
          this.alert_finanzas?.open_alert('¡Se ha realizado la acción con éxito!');
        }else this.alert_finanzas?.open_alert(response.error ?? '¡Error al realizar la acción!');

        this.loading = false;
        this.alert_finanzas?.close_alert(10000);
      }
    });
  }

  public close_modal():void{
    this.update_state = false;
    this.closeLoading.count_request = 0
    this.closeModal.emit();
  }

  public close_loading():void{
    this.closeLoading.count_request++;
    if(this.closeLoading.total_request == this.closeLoading.count_request) this.loading = false;
  }

  // -------------------------------------------------------- COTIZACIONES ------------------------------------------- // 
  
  public create_or_update($event:any):void{
    this.loading = true;
    let id_inventario = this.datalist_inventario.find(item => item.title.toLowerCase().trim() == $event.id_inventario.toLowerCase().trim())?.value,
    codigo_proyecto = $event.id_proyecto.split('-')[0].trim(),
    id_proyecto = this.datalist_proyects.find(proyect => proyect.codigo == codigo_proyecto)?.value;

    if(!id_inventario || !id_proyecto){
      this.alert_finanzas?.open_alert('¡Digita los valores correctamente!');
      return
    };

    let body = {...$event, id: this.id_cotizacion, id_proyecto, id_inventario}

    this._globalService.post_service('/cotizacion/insert_cotizacion', body).subscribe({
      next: (response:any)=>{
        if(response.successful){
          let new_data = response.data[0];
          new_data.createdAt = new_data.createdAt.split(' ')[0];

          if(this.state_edith_cotizaciones){
            this.datatable_cotizaciones?.renderData.next(this.datatable_cotizaciones?.renderData.getValue().map(item => item.id == this.id_cotizacion ? new_data : item));
          }else this.datatable_cotizaciones?.renderData.next([new_data, ...this.datatable_cotizaciones?.renderData.getValue()]);

          this.handler_reset();
          this.alert_finanzas?.open_alert('¡Se ha realizado la acción con éxito!');
          this.tabset_cotizaciones?.handler_change_tab('LISTA COTIZACIONES');
          
        }else this.alert_finanzas?.open_alert(response.error ?? '¡Error al realizar la acción!');
        this.loading = false;
        this.alert_finanzas?.close_alert(4000)
      }
    });
  }

  public setDatalistProyects(proyects:any[]):void{
    this.datalist_proyects = proyects;
  }

  public get_services():void{
    //INVENTARIO
    this._globalService.get_service('/inventario_material/lista_inventario_material?id=').subscribe({
      next: (response:any)=>{
        if(response.successful) this.datalist_inventario = response.data.map((item:any) => {return {value: item.id, title: item.nombre_material}});
        this.close_loading();
      },
      error: ()=>{}
    });

    //COTIZACIONES
    this._globalService.get_service(`/cotizacion/lista_cotizacion?id=${this.proyecto.id}`).subscribe({
      next: (response:any)=> {
        if(response.successful){
          this.datatable_cotizaciones?.renderData.next(response.data.map((item:any) => {
            item.createdAt = item.createdAt.split(' ')[0];
            return item
          }));
        }
        this.close_loading();
      }
    });
  }

  public delete_cotizacion({id}:any):void{
    this.loading = true;
    this._globalService.delete_service(`/cotizacion/delete_cotizacion?id=${id}`).subscribe({
      next: (response:any)=>{
        if(response.successful){
          this.datatable_cotizaciones?.renderData.next(
            this.datatable_cotizaciones?.renderData.getValue().filter(item => item.id != id)
          );

          this.alert_finanzas?.open_alert('¡Se ha realizado la acción con éxito!');
        }else this.alert_finanzas?.open_alert(response.error ?? '¡Error al realizar la acción!');
        
        this.loading = false;
        this.alert_finanzas?.close_alert(5000);
      }
    })
  }

  public handle_update_cotizacion({valor_unidad, cantidad, id_proyecto, id_inventario, id}:any):void{
    this.state_edith_cotizaciones = true;

    this.id_cotizacion = id;
    this.tabset_cotizaciones?.handler_change_tab('INGRESAR COTIZACIONES');
    this.form_dynamic_cotizaciones?.form_group.setValue({cantidad, valor_unidad,
      id_proyecto: this.datalist_proyects.find(proyect => proyect.value == id_proyecto)?.title,
      id_inventario: this.datalist_inventario.find(inventario => inventario.value == id_inventario)?.title,
    });
  }
}