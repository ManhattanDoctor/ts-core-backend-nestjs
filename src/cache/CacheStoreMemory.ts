import { CacheStoreSetOptions, LiteralObject, CacheStore } from '@nestjs/cache-manager';
import { DateUtil } from '@ts-core/common';
import * as _ from 'lodash';

export class CacheStoreMemory implements CacheStore {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static CHECK_DELAY = 30 * DateUtil.MILLISECONDS_SECOND;

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private map: Map<string, CachedValue<any>>;

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

    protected getTtl<T>(value: T, options: CacheStoreSetOptions<T> | number): number {
        if (_.isNumber(options)) {
            return options;
        }
        return _.isNumber(options.ttl) ? options.ttl : options.ttl(value);
    }

    protected isExpired<T>(item: CachedValue<T>, date: Date): boolean {
        return !_.isNil(item.expired) ? item.expired < date.getTime() : false;
    }

    protected check = (): void => {
        let date = new Date();
        this.map.forEach((item, key) => {
            if (this.isExpired(item, date)) {
                this.del(key);
            }
        });
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async get<T>(key: string): Promise<T> {
        let item = this.map.get(key);
        return item?.value;
    }

    public async set<T>(key: string, value: T, options: CacheStoreSetOptions<T> | number): Promise<void> {
        let ttl = this.getTtl(value, options);
        this.map.set(key, { value, expired: ttl > 0 ? Date.now() + ttl : null });
    }

    public async del(key: string): Promise<void> {
        this.map.delete(key);
    }
}

// --------------------------------------------------------------------------
//
//  Factory
//
// --------------------------------------------------------------------------

export class CacheStoreFactoryMemory {
    public create(args: LiteralObject): CacheStore {
        return new CacheStoreMemory();
    }
}

// --------------------------------------------------------------------------
//
//  Interface
//
// --------------------------------------------------------------------------

interface CachedValue<T> {
    value: T;
    expired?: number;
}
