import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateThirdPartyDTO {
    @IsString() @IsNotEmpty() @MaxLength(100)
    thirdPartyName: string;

    @IsNumber() @IsOptional()
    userId?: number; // Optional as it defaults to 1 in the database

    constructor(thirdPartyName: string, userId?: number) {
        this.thirdPartyName = thirdPartyName;
        this.userId = userId;
    }
}

export class UpdateThirdPartyDTO {
    @IsString() @IsOptional() @MaxLength(100)
    thirdPartyName?: string;

    constructor(thirdPartyName?: string, userId?: number) {
        this.thirdPartyName = thirdPartyName;
    }
}

/**
 * DTO for Third Party responses
 */
export class ThirdPartyResponseDTO {
    thirdPartyId: number;
    thirdPartyName: string;
    createdAt: Date;
    updatedAt?: Date;
    userId: number;

    constructor(thirdPartyId: number, thirdPartyName: string, userId: number, createdAt?: Date, updatedAt?: Date) {
        this.thirdPartyId = thirdPartyId;
        this.thirdPartyName = thirdPartyName;
        this.userId = userId;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt;
    }
}