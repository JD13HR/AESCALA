import { FormGroup, Validators, FormControl} from '@angular/forms';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-form-dynamic',
  templateUrl: './form-dynamic.component.html',
  styleUrls: ['./form-dynamic.component.css']
})
export class FormDynamicComponent implements OnInit {
  constructor(){}
  
  @Input() inputs:any[] = [];
  public form_group = new FormGroup({});
  @Output() submitEvent = new EventEmitter<any>();
  @Output() reset = new EventEmitter<any>();

  public submit():void{
    if(this.form_group.valid) {
      let value:any = this.form_group.value;

      this.inputs.forEach((section:any) => {
        section.inputs.forEach(({money, name}:any)=>{
          money && value[name] ? (value[name] = parseFloat(`${value[name]}`.replace(/[a-zA-Z]/g, '').replace(/,/g, ''))) : null
        })
      });

      this.submitEvent.emit(value);
      Object.keys(this.form_group.controls)?.forEach((key: string) => {
        let INPUT = document.getElementById(key); INPUT?.classList.remove('invalid'); INPUT?.classList.remove('valid');
      });
    } else{
      Object.entries(this.form_group.controls)?.forEach(([key, value]: [string, any]) => {
        let INPUT = document.getElementById(key);
        if(value.status == "INVALID"){INPUT?.classList.add('invalid'); INPUT?.classList.remove('valid')}
        else {INPUT?.classList.add('valid'); INPUT?.classList.remove('invalid')}
      })
    }
  }

  public validate_input(id:string){
    let input = document.getElementById(id);
    let inputs:any = this.form_group.controls;
    
    if(inputs[id].status == "INVALID"){
      input?.classList.add('invalid'); 
      input?.classList.remove('valid');
    }else input?.classList.remove('invalid')
  }

  public reset_values():void{
    let values:any = {};
    Object.keys(this.form_group.controls).map(key => values[key] = null);

    this.form_group.setValue(values);
    this.reset.emit();

    Object.keys(this.form_group.controls)?.forEach((key: string) => {
      let INPUT = document.getElementById(key); INPUT?.classList.remove('invalid'); INPUT?.classList.remove('valid');
    });
  }

  ngOnInit(): void {
    this.inputs?.forEach(section => {

      section.inputs.forEach((item:any) => {
        this.form_group.setControl(item.name, new FormControl(item.value))
        let control:any = this.form_group.controls;

        control[item.name].addValidators(item?.validators?.map((item:any) => {
          let validator:any = Validators;
          return validator[item]
        }))
        
        setTimeout(() => {
          Object.entries(item.attributes).map(([key, value]: [string, any])=> {
            document.getElementById(item.name)?.setAttribute(key, value);
          });
        }, 200);
      });
      
    })
  }
}
