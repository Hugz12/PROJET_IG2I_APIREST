import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateThirdPartyDTO {
    @IsString() @IsNotEmpty() @MaxLength(100)
    	thirdPartyName: string;

    constructor(thirdPartyName: string) {
    	this.thirdPartyName = thirdPartyName;
    }
}

export class UpdateThirdPartyDTO {
    @IsString() @MaxLength(100)
    	thirdPartyName: string;

    constructor(thirdPartyName: string) {
    	this.thirdPartyName = thirdPartyName;
    }
}

/**
 * DTO for Third Party responses
 */
export class ThirdPartyResponseDTO {
	thirdPartyId: number;
	thirdPartyName: string;
	createdAt?: Date;
	updatedAt?: Date;
	userId: number;

	constructor(thirdPartyId: number, thirdPartyName: string, userId: number, createdAt?: Date, updatedAt?: Date) {
    	this.thirdPartyId = thirdPartyId;
    	this.thirdPartyName = thirdPartyName;
    	this.userId = userId;
    	this.createdAt = createdAt;
    	this.updatedAt = updatedAt;
	}
}
