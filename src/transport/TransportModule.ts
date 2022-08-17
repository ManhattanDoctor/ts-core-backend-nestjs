import { DynamicModule, Provider } from '@nestjs/common';
import { ITransportAmqpSettings, TransportAmqp } from '@ts-core/backend';
import { Logger, Transport, TransportLocal, ITransportHttpSettings, TransportHttp, ExtendedError } from '@ts-core/common';

export class TransportModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings?: ITransportModuleSettings): DynamicModule {
        let providers: Array<Provider> = [];
        let type = settings ? settings.type : TransportType.LOCAL;
        switch (type) {
            case TransportType.LOCAL:
                providers.push({
                    provide: Transport,
                    inject: [Logger],
                    useFactory: (logger: Logger) => {
                        return new TransportLocal(logger);
                    }
                });
                break;
            case TransportType.HTTP:
                providers.push({
                    provide: Transport,
                    inject: [Logger],
                    useFactory: (logger: Logger) => {
                        return new TransportHttp(logger, settings.options as ITransportHttpSettings);
                    }
                });
                break;
            case TransportType.AMQP:
                providers.push({
                    provide: Transport,
                    inject: [Logger],
                    useFactory: async (logger: Logger) => {
                        let item = new TransportAmqp(logger, settings.options as ITransportAmqpSettings);
                        await item.connect();
                        return item;
                    }
                });
                break;
            default:
                throw new ExtendedError(`Can't to create transport for ${type} type`);
        }

        return {
            global: true,
            module: TransportModule,
            exports: providers,
            providers,
        };
    }
}

export interface ITransportModuleSettings {
    type: TransportType;
    options?: ITransportAmqpSettings | ITransportHttpSettings;
}

export enum TransportType {
    LOCAL = 'LOCAL',
    AMQP = 'AMQP',
    HTTP = 'HTTP'
}
