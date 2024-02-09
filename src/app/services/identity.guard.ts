import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable()
export class IdentityGuard {
    
    constructor(private _router: Router){}

    canActivate(){
        let identity = true;
        
        if(identity) return true;
        else {
            this._router.navigate(['login']);
            return false;
        }
    }
}