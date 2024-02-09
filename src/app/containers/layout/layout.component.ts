import { filter } from 'rxjs/operators';
import { Component, OnInit} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavUtil } from 'src/app/utils/nav.util';

@Component({
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})

export class LayoutComponent implements OnInit{

  constructor(private router: Router, private _navUtil: NavUtil){}

  public currentPage:string = '';
  public navItems:any[] = [];

  public logout():void{
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const url = window.location.href.split('/');
    this.currentPage = `/${url[url.length - 1]}`;

    this._navUtil.navItems.subscribe((value)=>{
      this.navItems = value;
    })

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event:any) => {
      this.currentPage = event['url']
    });
  }
}
