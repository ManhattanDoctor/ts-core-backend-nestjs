import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { IExceptionFilter } from './IExceptionFilter';
import * as _ from 'lodash';

@Catch()
export class AllErrorFilter implements ExceptionFilter<any> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected filters: Array<IExceptionFilter>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(...filters: Array<IExceptionFilter>) {
        this.filters = filters;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected handleException(exception: any, host: ArgumentsHost): any {
        let status = exception instanceof HttpException ? exception.getStatus() : exception.status;
        let message = exception.message;
        if (_.isNil(status)) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        if (_.isNil(message)) {
            message = `Unknown error`;
        }
        let response = { code: status, message, details: exception };
        host.switchToHttp().getResponse().status(status).json(response);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public catch(exception: any, host: ArgumentsHost): any {
        if (!_.isEmpty(this.filters)) {
            for (let item of this.filters) {
                if (item.instanceOf(exception)) {
                    return item.catch(exception, host);
                }
            }
        }
        return this.handleException(exception, host);
    }
}
