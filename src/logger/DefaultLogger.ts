import { ConsoleLogger } from '@nestjs/common';
import { LoggerLevel, LoggerWrapper } from '@ts-core/common';
import * as clc from 'cli-color';
import * as _ from 'lodash';

export class DefaultLogger extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public isTimeDifferenceEnabled: boolean = true;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(level: LoggerLevel, context?: any) {
        super(new ConsoleLogger(), context, level);
        this.logger['printMessages'] = this.printMessages;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected printMessages = (messages: Array<any>, context?: string, logLevel?: LoggerLevel, writeStreamType?: 'stdout' | 'stderr'): void => {
        let date = new Date();
        let color = this.logger['getColorByLogLevel'](logLevel);

        let timestamp = `${date
            .getHours()
            .toString()
            .padStart(2, '0')}:${date
                .getMinutes()
                .toString()
                .padStart(2, '0')}:${date
                    .getSeconds()
                    .toString()
                    .padStart(2, '0')}:${date
                        .getMilliseconds()
                        .toString()
                        .padStart(3, '0')}`;

        for (let message of messages) {
            let output = _.isObject(message) ? `\n${JSON.stringify(message, null, 4)}\n` : color(message);
            let contextMessage = !_.isNil(context) ? clc.yellow(`[${context}] `) : '';
            let timestampDiff = this.updateAndGetTimestampDiff();
            process.stdout.write(`${timestamp} ${contextMessage}${output}${timestampDiff}\n`);
        }
    }

    private updateAndGetTimestampDiff(): string {
        let isNeedTimestamp = this.lastTimestampAt && this.isTimeDifferenceEnabled;
        let item = isNeedTimestamp ? clc.yellow(` +${Date.now() - this.lastTimestampAt}ms`) : '';
        this.lastTimestampAt = Date.now();
        return item;
    };


    private get lastTimestampAt(): number {
        return this.logger['lastTimestampAt'];
    }

    private set lastTimestampAt(value: number) {
        this.logger['lastTimestampAt'] = value;
    }

}
