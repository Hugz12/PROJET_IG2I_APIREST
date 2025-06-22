export class CategoryResponseDTO {
    idCategorie: number;
    nomCategorie: string;
    dateHeureCreation: Date;
    dateHeureMAJ: Date;
    sousCategories?: SubCategoryResponseDTO[];

    constructor(
    	idCategorie: number,
    	nomCategorie: string,
    	dateHeureCreation: Date,
    	dateHeureMAJ: Date,
    	sousCategories?: SubCategoryResponseDTO[]
    ) {
    	this.idCategorie = idCategorie;
    	this.nomCategorie = nomCategorie;
    	this.dateHeureCreation = dateHeureCreation;
    	this.dateHeureMAJ = dateHeureMAJ;
    	this.sousCategories = sousCategories;
    }
}

export class SubCategoryResponseDTO {
    idSousCategorie: number;
    nomSousCategorie: string;
    idCategorie: number;
    dateHeureCreation: Date;
    dateHeureMAJ: Date;

    constructor(
    	idSousCategorie: number,
    	nomSousCategorie: string,
    	idCategorie: number,
    	dateHeureCreation: Date,
    	dateHeureMAJ: Date
    ) {
    	this.idSousCategorie = idSousCategorie;
    	this.nomSousCategorie = nomSousCategorie;
    	this.idCategorie = idCategorie;
    	this.dateHeureCreation = dateHeureCreation;
    	this.dateHeureMAJ = dateHeureMAJ;
    }
}
