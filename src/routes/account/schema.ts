import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAccountDTO {
    @IsString() @IsNotEmpty() @MinLength(3)
    descriptionCompte: string;

    @IsString() @IsNotEmpty() @MinLength(3)
    nomBanque: string;

    @IsNumber() @IsNotEmpty()
    soldeInitial: number;

    constructor(descriptionCompte: string, nomBanque: string, soldeInitial: number) {
        this.descriptionCompte = descriptionCompte;
        this.nomBanque = nomBanque;
        this.soldeInitial = soldeInitial;
    }
}
