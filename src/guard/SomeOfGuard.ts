import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { PromiseHandler } from '@ts-core/common/promise';
import * as _ from 'lodash';

@Injectable()
export class SomeOfGuard implements CanActivate {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected injector: ModuleRef, protected reflector: Reflector) {}

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        let tokens = this.reflector.get<Array<any>>(SomeOfGuard, context.getHandler());
        if (!_.isArray(tokens) || _.isEmpty(tokens)) {
            throw new Error(`Use "SomeOfGuard" MetaData reflection`);
        }

        for (let token of tokens) {
            let guard = this.injector.get<CanActivate>(token);
            try {
                if (await PromiseHandler.toPromise(guard.canActivate(context))) {
                    return true;
                }
            } catch (error) {}
        }

        return false;
    }
}
