import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class GlobalService {
    
    private url:string;

    constructor(public _http: HttpClient){
        this.url = environment.url;
    }

    public post_service(url:string, settings:any, resType?:any){        
        let token  = localStorage.getItem('token'); 
        return this._http.post(
            `${this.url}${url}`, {...settings}, 
            {
                responseType: resType, 
                headers: {Authorization: 'Bearer '  + token}
            }
        )
    }

    public delete_service(url:string){        
        let token  = localStorage.getItem('token'); 
        return this._http.delete(
            `${this.url}${url}`, 
            {
                headers: {Authorization: 'Bearer '  + token}
            }
        )
    }

    public get_service(url:string){  
        let token  = localStorage.getItem('token'); 
        return this._http.get(`${this.url}${url}`, {
            headers: {Authorization: 'Bearer '  + token}
        }
        )
    }
}