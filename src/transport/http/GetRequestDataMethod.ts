import * as _ from 'lodash';

export function GetRequestDataMethod<T = any>(request: any): T {
    if (_.isNil(request) || _.isNil(request.method)) {
        return null;
    }
    switch (request.method.toLowerCase()) {
        case 'put':
        case 'post':
        case 'patch':
            return request.body;
        default:
            return request.query;
    }
}
