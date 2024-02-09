import { Component } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {

  public alert:boolean = false;
  public text:string|null = null;

  public open_alert(text:string):void{
    this.text = text;
    this.alert = true;
  }

  public close_alert(time:number|null=null){
    if(time){
      setTimeout(() => this.alert = false, time);
      return;
    }
    this.alert = false;
  }
}
