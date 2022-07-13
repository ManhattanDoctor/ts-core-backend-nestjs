import { ArgumentsHost } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ObjectUtil, ExtendedError, TransformUtil, ValidateUtil } from '@ts-core/common';
import * as _ from 'lodash';
import { IExceptionFilter } from './IExceptionFilter';

export class ValidationExceptionFilter implements IExceptionFilter<ValidationException> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public instanceOf(exception: any): exception is ValidationException {
        if (!ObjectUtil.hasOwnProperties(exception, ['status', 'message', 'response'])) {
            return false;
        }
        return _.isArray(exception.response.message);
    }

    public catch(exception: ValidationException, host: ArgumentsHost): void {
        let context = host.switchToHttp();
        let response = context.getResponse();

        let error = new ExtendedError(ValidateUtil.toString(exception.response.message), exception.response.statusCode, exception.response.message);
        response.status(error.code).json(TransformUtil.fromClass(error));
    }
}

export class ValidationException extends Error implements Error {
    public response: {
        error: string;
        message: Array<ValidationError>;
        statusCode: number;
    };
}
