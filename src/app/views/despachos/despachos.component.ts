import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { GlobalService } from 'src/app/services/global.service';
import { GlobalUtil } from 'src/app/utils/global.util';

@Component({
  templateUrl: './despachos.component.html',
  styleUrls: ['./despachos.component.css']
})
export class DespachosComponent implements OnInit{

  constructor(private _globalService: GlobalService, private _globalUtil: GlobalUtil){}

  public loading:boolean = true;
  public datalist_users:any[] = [];
  public data_inventario:any[] = [];
  public state_edit:boolean = false;
  public datalist_proyects:any[] = [];
  public datalist_inventario:any[] = [];
  public proyect_selected:any|null = null;
  public inventarios_selected:any[] = [];
  public close_loading_data = {request: 0, cant_request:3};

  @ViewChild('alert_despachos') alert_despachos:AlertComponent | null = null;

  public form_despachos = new FormGroup({
    data: new FormControl([]),
    inventario_selected: new FormControl(''),
    tipo: new FormControl('', Validators.required),
    codigo: new FormControl(this._globalUtil.generateRandomCode(), Validators.required),
    id_user: new FormControl('', Validators.required),
    id_proyecto: new FormControl('', Validators.required),
  });

  public change_value_inventario(inventario:any):void{
    inventario.cantidad = inventario.cantidad_static - inventario.cantidad_usuario
  }

  public delete_inventario(inventario_selected:any):void{
    this.datalist_inventario.unshift(inventario_selected);
    this.inventarios_selected = this.inventarios_selected.filter(inventario => inventario.id != inventario_selected.id)
  }

  public select_proyect():void{
    this.proyect_selected = this.datalist_proyects.find(proyect => proyect.id == this.form_despachos.controls['id_proyecto'].value);
  }

  public select_inventario():void{
    let id_inventario = this.form_despachos.controls['inventario_selected'].value,
    item_inventario = this.data_inventario.find(inventario => inventario.id == id_inventario),
    cantidad = item_inventario.cantidad - 1;

    if(id_inventario == 'null') return;


    this.inventarios_selected.push({
      ...item_inventario,
      cantidad,
      cantidad_usuario: 1,
      cantidad_static: cantidad
    });

    this.form_despachos.controls['inventario_selected'].setValue("");
    this.datalist_inventario = this.datalist_inventario.filter(inventario => inventario.id != id_inventario);
  }

  public close_loading():void{
    this.close_loading_data.request++;

    if(this.close_loading_data.request == this.close_loading_data.cant_request){
      this.loading = false;
    }
  }

  public handler_cancel_action():void{
    this.datalist_inventario = this.data_inventario;
    this.form_despachos.reset();
    this.proyect_selected = null;
    this.inventarios_selected = [];

    Object.keys(this.form_despachos.controls).forEach((key:string) => {
      let element = document.getElementById(`input-${key}`);
      element?.classList.remove('valid', 'border-green-500');
      element?.classList.remove('invalid','border-red-500');
    });

    this.form_despachos.controls.codigo.setValue(this._globalUtil.generateRandomCode());
  }

  public create_or_update_despachos():void{
    if(this.validate_inputs()) { this.alert_despachos?.open_alert('¡Completa los campos correctamente!'); return
    }else this.alert_despachos?.close_alert();

    this.loading = true;

    let body = {
      ...this.form_despachos.value,
      data: this.inventarios_selected.map(({id,valor_unidad, cantidad_usuario } )=>{
        return {id_material: id, valor_unidad, cantidad: cantidad_usuario }
      })
    };

    this._globalService.post_service('/inventario_material/insert_inventario_solicitud', body).subscribe({
      next: (response:any)=>{
        if(response.successful){
          this.handler_cancel_action();
          this.alert_despachos?.open_alert('¡Se ha realizado la operación con éxito!');
        } else this.alert_despachos?.open_alert(response.error ?? '¡Error al realizar la acción!');
  
        this.alert_despachos?.close_alert(10000);
        this.loading = false;
      }
    });
  }

  public validate_inputs():boolean{
    Object.keys(this.form_despachos.controls).forEach((key:string) => {
      let controls:any = this.form_despachos.controls,
      element = document.getElementById(`input-${key}`);

      if(controls[key].invalid){
        element?.classList.add('invalid', 'border-red-500');
        element?.classList.remove('valid', 'border-green-500');
      }else{
        element?.classList.add('valid', 'border-green-500');
        element?.classList.remove('invalid','border-red-500');
      }
    });

    let invalid = this.form_despachos.invalid;
    if(this.inventarios_selected.length == 0) invalid = true;

    return invalid;
  }

  public get_inventario():void{
    this._globalService.get_service('/inventario_material/lista_inventario_material?id=').subscribe({
      next:(response:any)=>{
        if(response.successful){
          this.data_inventario = response.data;
          this.datalist_inventario = response.data;
        }
        
        this.close_loading();
      }
    });
  }

  public get_proyects():void{
    this._globalService.get_service('/proyecto/lista_proyectosxtipo?id=1').subscribe({
    //this._globalService.get_service('/proyecto/lista_proyectos?id=').subscribe({
      next: (response:any)=>{
        if(response.successful){
          this.datalist_proyects = response.data.map((item:any) =>{
            let fecha = new Date(item.fec_fin_estimado).getTime(),
            now_fecha = new Date().getTime();
            item.dias_restantes = Math.floor((fecha - now_fecha) / (1000 * 60 * 60 * 24));
            item.total = Number(item.pres_mano_obra) + Number(item.pres_materiales) + Number(item.pres_otros);
    
            return item
          });
        }
        this.close_loading();
      }
    });    
  }

  public get_users():void{
    this._globalService.get_service('/user/lista_users?id=').subscribe({
      next: (response:any)=>{
        if(response.successful){
          this.datalist_users = response.data.filter((user:any) => user.rol_name == 'Colaborador');
        }
        this.close_loading();
      }
    });
  }

  ngOnInit(): void {
    this.get_users();
    this.get_proyects();
    this.get_inventario();

    // const ID_DESPACHO = this.route.snapshot.paramMap.get('id');

    // if(ID_DESPACHO){
    //   this._globalService.get_service('')
    // }
  }
}
