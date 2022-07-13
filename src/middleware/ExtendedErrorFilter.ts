import { ArgumentsHost, Catch, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { TransformUtil, ExtendedError } from '@ts-core/common';
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

        response.status(this.getStatus(exception)).json(TransformUtil.fromClass(exception));
    }

    public instanceOf(item: any): boolean {
        return ExtendedError.instanceOf(item);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getStatus(item: ExtendedError): number {
        let value = ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
        if (item.code in HttpStatus) {
            value = item.code;
        }
        return value;
    }

    protected getCode(item: ExtendedError): number {
        return !_.isNil(item.code) ? item.code : ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
    }

    protected getMessage(item: ExtendedError): string {
        return !_.isNil(item.message) ? item.message : ExtendedErrorFilter.DEFAULT_ERROR.message;
    }

    protected getDetails<T>(item: ExtendedError): T {
        return item.details;
    }
}
