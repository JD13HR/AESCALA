import { Component, OnInit  } from '@angular/core';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  public user:any = {};

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') ?? '');
  }
}
