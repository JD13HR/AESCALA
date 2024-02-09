import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit{

  // private modal_state:boolean = false;
  @Input() size:number = 3;
  @ViewChild('modal') modal:ElementRef|null = null;

  public open_modal():void{
    this.modal?.nativeElement.classList.remove('scale-0');
    this.modal?.nativeElement.classList.add('scale-100');
  }

  public close_modal():void{
    this.modal?.nativeElement.classList.remove('scale-100');
    this.modal?.nativeElement.classList.add('scale-0');
  }
  
  ngOnInit(): void { }
}
