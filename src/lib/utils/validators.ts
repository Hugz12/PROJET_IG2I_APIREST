import { 
    ValidationOptions, 
    ValidatorConstraint, 
    ValidatorConstraintInterface, 
    registerDecorator 
} from 'class-validator';

@ValidatorConstraint({ name: 'isPositiveAmount', async: false })
export class IsPositiveAmountConstraint implements ValidatorConstraintInterface {
    validate(value: any): boolean {
        return typeof value === 'number' && value > 0;
    }

    defaultMessage(): string {
        return 'Amount must be a positive number';
    }
}

@ValidatorConstraint({ name: 'isValidMovementType', async: false })
export class IsValidMovementTypeConstraint implements ValidatorConstraintInterface {
    validate(value: any): boolean {
        return value === 'D' || value === 'C';
    }

    defaultMessage(): string {
        return 'Movement type must be either "D" (debit) or "C" (credit)';
    }
}

@ValidatorConstraint({ name: 'isValidPostalCode', async: false })
export class IsValidPostalCodeConstraint implements ValidatorConstraintInterface {
    validate(value: any): boolean {
        if (typeof value !== 'string' && typeof value !== 'number') return false;
        const stringValue = value.toString();
        return /^\d{5}$/.test(stringValue);
    }

    defaultMessage(): string {
        return 'Postal code must be exactly 5 digits';
    }
}

// Custom decorators
export function IsPositiveAmount(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPositiveAmountConstraint,
        });
    };
}

export function IsValidMovementType(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidMovementTypeConstraint,
        });
    };
}

export function IsValidPostalCode(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidPostalCodeConstraint,
        });
    };
}
