import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-tabset',
  templateUrl: './tabset.component.html',
  styleUrls: ['./tabset.component.css']
})

export class TabsetComponent implements OnInit {
  @Input() tabs:any[] = [];
  @Input() id:string = 'tabset';
  public tab:string|null = null;
  @Input() default:string|null = null;
  @Output() changeTab = new EventEmitter<string>();
  @Input() order:'flex-row'|'flex-row-reverse' = 'flex-row';

  public handler_change_tab(tab:string):void{
    document.getElementById(this.tab ?? '')?.classList.add('hidden');    
    document.getElementById(tab)?.classList.remove('hidden');
  
    this.tab = tab;
    this.changeTab.emit(this.tab);
  }

  ngOnInit(): void {
    setTimeout(() => {
      document.getElementById(`content-tabset-${this.id}`)?.childNodes.forEach((item:any, index:number)=>{
        if(this.default == null && index == 0){ this.tab = item.id; return }
        else if(item.id == this.default){this.tab = item.id; return};        
        item.classList.add('hidden');
      })
    }, 0);
  }
}
