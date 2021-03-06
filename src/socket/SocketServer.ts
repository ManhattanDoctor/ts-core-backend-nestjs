import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { ExtendedError } from '@ts-core/common/error';
import { LoggerWrapper } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { Namespace, Socket } from 'socket.io';

export abstract class SocketServer extends LoggerWrapper implements OnGatewayInit<Namespace>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected namespace: Namespace;

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async clientVerify(client: Socket): Promise<void> {}

    protected async clientVerifySucceedHandler(client: Socket): Promise<void> {}

    protected async clientVerifyFailedHandler(client: Socket, error: ExtendedError): Promise<void> {
        client.disconnect(true);
    }

    protected async clientDisconnectedHandler(client: Socket): Promise<void> {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();
        this.namespace = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    public afterInit(item: Namespace): any {
        this.log(`Initialized on namespace "${item.name}"`);
        this.namespace = item;
    }

    public async handleConnection(client: Socket): Promise<any> {
        try {
            await this.clientVerify(client);
            this.clientVerifySucceedHandler(client);
        } catch (error) {
            this.clientVerifyFailedHandler(client, ExtendedError.create(error));
        }
    }

    public handleDisconnect(client: Socket): any {
        this.clientDisconnectedHandler(client);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get isHasNamespace(): boolean {
        return !_.isNil(this.namespace);
    }
}

export const originAnyPreflightHandler = (request, response) => {
    response.writeHead(200, {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        // 'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Origin': request.headers.origin,
        'Access-Control-Allow-Credentials': true
    });
    response.end();
};
