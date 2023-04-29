import { ArgumentsHost, Catch } from '@nestjs/common';
import { isAxiosError, parseAxiosError } from '@ts-core/common';
import { AxiosError } from 'axios';
import { IExceptionFilter } from './IExceptionFilter';
import { ExtendedErrorFilter } from './ExtendedErrorFilter';
import * as _ from 'lodash';

@Catch(AxiosError)
export class AxiosErrorFilter implements IExceptionFilter<AxiosError> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public instanceOf(item: any): item is AxiosError {
        return isAxiosError(item);
    }

    public catch(exception: AxiosError, host: ArgumentsHost): any {
        let error = parseAxiosError(exception);
        return ExtendedErrorFilter.catch(error, host, ExtendedErrorFilter.getStatus(error));
    }
}
