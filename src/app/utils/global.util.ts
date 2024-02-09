import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class GlobalUtil{
    // Función para generar un código de 3 letras y 2 números aleatorios
    public generateRandomCode(): string {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Cadena de letras válidas
        const minNumber = 10; // Número mínimo (inclusive) que se generará
        const maxNumber = 99; // Número máximo (inclusive) que se generará
    
        // Función auxiliar para obtener un carácter aleatorio de la cadena de letras
        function getRandomLetter(): string {
        const randomIndex = Math.floor(Math.random() * letters.length);
        return letters[randomIndex];
        }
    
        // Función auxiliar para obtener un número aleatorio dentro del rango especificado
        function getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    
        // Generar las 3 letras aleatorias
        const randomLetters = Array.from({ length: 3 }, getRandomLetter).join('');
    
        // Generar los 2 números aleatorios
        const randomNumbers = Array.from({ length: 1 }, () => getRandomNumber(minNumber, maxNumber))
                                .map(num => num.toString().padStart(2, '0')) // Asegurar que sean de dos dígitos
    
        // Combinar letras y números y retornar el código generado
        return randomLetters + randomNumbers.join('');
    }
}
