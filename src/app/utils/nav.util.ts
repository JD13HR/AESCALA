import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class NavUtil{
    public navItems = new BehaviorSubject<any[]>([]);
}
