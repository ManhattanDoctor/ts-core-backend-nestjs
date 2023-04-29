import { ArgumentsHost } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ObjectUtil, ExtendedError, ValidateUtil } from '@ts-core/common';
import { IExceptionFilter } from './IExceptionFilter';
import { ExtendedErrorFilter } from './ExtendedErrorFilter';
import * as _ from 'lodash';

export class ValidationExceptionFilter implements IExceptionFilter<ValidationException> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public instanceOf(item: any): item is ValidationException {
        return ObjectUtil.instanceOf<ValidationException>(item, ['status', 'response']) && _.isArray(item.response.message);
    }

    public catch(exception: ValidationException, host: ArgumentsHost): any {
        let error = new ExtendedError(ValidateUtil.toString(exception.response.message), exception.response.statusCode, exception.response.message);
        return ExtendedErrorFilter.catch(error, host, error.code);
    }
}

export class ValidationException extends Error {
    status: number;
    response: IValidationExceptionResponse;
}

interface IValidationExceptionResponse {
    error: string;
    message: Array<ValidationError>;
    statusCode: number;
}
