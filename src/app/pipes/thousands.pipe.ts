import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousands'
})

export class ThousandsPipe implements PipeTransform {

  transform(value:string = '', ...args: unknown[]): string|undefined {
    let _value = parseFloat(value.replace(/[a-zA-Z]/g, '').replace(/,/g, ''));

    if(isNaN(_value)) return '';
    return new Intl.NumberFormat('es-MX').format(_value)
  }
}