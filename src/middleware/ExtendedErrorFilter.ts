import { ArgumentsHost, Catch, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { IExceptionFilter } from './IExceptionFilter';

@Catch(ExtendedError)
export class ExtendedErrorFilter implements IExceptionFilter<ExtendedError> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_ERROR = new InternalServerErrorException();

    public static getCode?: (item: ExtendedError) => number;
    public static getMessage?: (item: ExtendedError) => string;
    public static getDetails?: <T>(item: ExtendedError) => T;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: ExtendedError, host: ArgumentsHost): any {
        let context = host.switchToHttp();
        let response = context.getResponse();

        exception.code = this.getCode(exception);
        exception.message = this.getMessage(exception);
        exception.details = this.getDetails(exception);

        let status = ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
        if (exception.code in HttpStatus) {
            status = exception.code;
        }
        response.status(status).json(TransformUtil.fromClass(exception));
    }

    public instanceOf(item: any): item is ExtendedError {
        return ExtendedError.instanceOf(item);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getCode(item: ExtendedError): number {
        if (!_.isNil(ExtendedErrorFilter.getCode)) {
            return ExtendedErrorFilter.getCode(item);
        }
        return !_.isNil(item.code) ? item.code : ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
    }

    protected getMessage(item: ExtendedError): string {
        if (!_.isNil(ExtendedErrorFilter.getMessage)) {
            return ExtendedErrorFilter.getMessage(item);
        }
        return !_.isNil(item.message) ? item.message : ExtendedErrorFilter.DEFAULT_ERROR.message;
    }

    protected getDetails<T>(item: ExtendedError): T {
        if (!_.isNil(ExtendedErrorFilter.getDetails)) {
            return ExtendedErrorFilter.getDetails(item);
        }
        return item.details;
    }
}
