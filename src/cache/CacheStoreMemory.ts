import { CacheStoreSetOptions, LiteralObject, CacheStoreFactory, CacheStore } from '@nestjs/common';
import { DateUtil } from '@ts-core/common';
import * as _ from 'lodash';

export class CacheStoreMemory {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static CHECK_DELAY = DateUtil.MILLISECONDS_MINUTE / 10;

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private map: Map<string, CachedValue>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(checkDelay?: number) {
        this.map = new Map();
        setInterval(this.check, !_.isNil(checkDelay) ? checkDelay : CacheStoreMemory.CHECK_DELAY);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getTtl<T>(value: T, options: CacheStoreSetOptions<T>): number {
        if (_.isNumber(options)) {
            return options;
        }
        if (_.isNumber(options.ttl)) {
            return options.ttl;
        }
        return options.ttl(value);
    }

    private isExpired(item: CachedValue): boolean {
        return !_.isNil(item.expired) ? item.expired < Date.now() : false;
    }

    private check = (): void => {
        this.map.forEach((item, key) => {
            if (this.isExpired(item)) {
                this.map.delete(key);
            }
        });
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public get<T>(key: string, options: CacheStoreSetOptions<T>, callback: Function): void {
        if (_.isFunction(options)) {
            callback = options
        }
        let item = this.map.get(key);
        if (_.isNil(item)) {
            callback(null, undefined);
            return;
        }
        if (this.isExpired(item)) {
            this.map.delete(key);
            callback(null, undefined);
            return;
        }
        callback(null, item.value);
    }

    public set<T>(key: string, value: T, options: CacheStoreSetOptions<T>, callback: Function): void {
        if (_.isFunction(options)) {
            callback = options
        }
        let ttl = this.getTtl(value, options);
        let item: CachedValue = { value, expired: ttl > 0 ? Date.now() + ttl : null };
        this.map.set(key, item);
        callback(null, true);
    }

    public del<T>(key: string, options: CacheStoreSetOptions<T>, callback: Function): void {
        if (_.isFunction(options)) {
            callback = options
        }
        if (!_.isFunction(callback)) {
            callback = (): void => { };
        }
        this.map.delete(key);
        callback(null, null)
    }
}

// --------------------------------------------------------------------------
//
//  Factory
//
// --------------------------------------------------------------------------

export class CacheStoreFactoryMemory implements CacheStoreFactory {
    public create(args: LiteralObject): CacheStore {
        return new CacheStoreMemory() as any;
    }
}

// --------------------------------------------------------------------------
//
//  Interface
//
// --------------------------------------------------------------------------

interface CachedValue {
    value: any;
    expired?: number;
}
