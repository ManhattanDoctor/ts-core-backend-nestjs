import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { IExceptionFilter } from './IExceptionFilter';

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
        let response = host.switchToHttp().getResponse();
        let httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        let json = { code: httpStatus, message: exception.message, details: TransformUtil.fromClass(exception) };
        response.status(httpStatus).json(json);
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
