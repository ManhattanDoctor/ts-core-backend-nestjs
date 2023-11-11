import { DynamicModule, Provider, } from '@nestjs/common';
import { CacheModule as NestCacheModule, CacheModuleOptions, CACHE_MANAGER, CACHE_MODULE_OPTIONS } from '@nestjs/cache-manager';
import { Cache } from './Cache';

export class CacheModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings?: CacheModuleOptions): DynamicModule {
        const providers: Array<Provider> = [
            {
                provide: CACHE_MODULE_OPTIONS,
                useValue: settings
            },
            {
                provide: Cache,
                inject: [CACHE_MANAGER],
                useFactory: item => item
            },
        ];
        return {
            global: true,
            imports: [NestCacheModule.register(settings)],
            module: CacheModule,
            exports: providers,
            providers
        };
    }
}
