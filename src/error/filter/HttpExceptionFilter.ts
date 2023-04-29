import { ArgumentsHost, HttpException, Catch } from '@nestjs/common';
import { ExtendedError, TransformUtil } from '@ts-core/common';
import * as _ from 'lodash';
import { IExceptionFilter } from './IExceptionFilter';
import { ExtendedErrorFilter } from './ExtendedErrorFilter';

@Catch(HttpException)
export class HttpExceptionFilter implements IExceptionFilter<HttpException> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: HttpException, host: ArgumentsHost): any {
        let error = new ExtendedError(this.getMessage(exception), this.getCode(exception), this.getDetails(exception));
        return ExtendedErrorFilter.catch(error, host, exception.getStatus());
    }

    public instanceOf(item: any): item is HttpException {
        return item instanceof HttpException;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getCode(item: HttpException): number {
        return item.getStatus();
    }

    protected getMessage(item: HttpException): string {
        return item.toString();
    }

    protected getDetails(item: HttpException): any {
        if (!_.isNil(item.message) && _.isArray(item.message)) {
            return item.message;
        }
        return null;
    }
}
