import { ArgumentsHost, Catch, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { TransformUtil, ExtendedError } from '@ts-core/common'
import { IExceptionFilter } from './IExceptionFilter';
import * as _ from 'lodash';

@Catch(ExtendedError)
export class ExtendedErrorFilter<T extends ExtendedError> implements IExceptionFilter<T> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static DEFAULT_ERROR = new InternalServerErrorException();

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static catch(error: ExtendedError, host: ArgumentsHost, status: number): any {
        host.switchToHttp().getResponse().status(status).json(TransformUtil.fromClass(error));
    }

    public static getStatus(item: ExtendedError): number {
        let value = ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
        if (item.code in HttpStatus) {
            value = item.code;
        }
        return value;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public instanceOf(item: any): item is T {
        return ExtendedError.instanceOf(item);
    }

    public catch(error: T, host: ArgumentsHost): any {
        error.code = this.getCode(error);
        error.message = this.getMessage(error);
        error.details = this.getDetails(error);
        return ExtendedErrorFilter.catch(error, host, this.getStatus(error));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getStatus(item: T): number {
        return ExtendedErrorFilter.getStatus(item);
    }

    protected getCode(item: T): number {
        return !_.isNil(item.code) ? item.code : ExtendedErrorFilter.DEFAULT_ERROR.getStatus();
    }

    protected getMessage(item: T): string {
        return !_.isNil(item.message) ? item.message : ExtendedErrorFilter.DEFAULT_ERROR.message;
    }

    protected getDetails<U = any>(item: T): U {
        return item.details;
    }
}
