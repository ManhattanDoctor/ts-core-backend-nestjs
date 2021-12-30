import { Method } from 'axios';
import { RequestMethod } from '@nestjs/common';

export function ConvertRequestMethod(method: Method): RequestMethod {
    return RequestMethod[method.toUpperCase()];
}
