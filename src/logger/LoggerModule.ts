import { DynamicModule, Global, Provider } from '@nestjs/common';
import { ILoggerSettings } from '@ts-core/backend/settings';
import { Logger, LoggerLevel } from '@ts-core/common/logger';
import { DefaultLogger } from './DefaultLogger';
import * as _ from 'lodash';

export class LoggerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: ILoggerSettings): DynamicModule {
        let providers: Array<Provider> = [];
        providers.push({
            provide: Logger,
            useValue: settings.logger || new DefaultLogger(settings.loggerLevel)
        });

        return {
            global: true,
            module: LoggerModule,
            exports: providers,
            providers,
        };
    }
}
