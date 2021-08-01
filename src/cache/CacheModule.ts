import { DynamicModule, Provider, Global, CacheModuleOptions, CACHE_MANAGER } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/common';
import { CACHE_MODULE_OPTIONS } from '@nestjs/common/cache/cache.constants';
import { Cache } from './Cache';

@Global()
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
            {
                provide: CACHE_MANAGER,
                inject: [CACHE_MANAGER],
                useFactory: item => item
            }
        ];
        return {
            imports: [NestCacheModule.register(settings)],
            module: CacheModule,
            providers,
            exports: providers
        };
    }
}
