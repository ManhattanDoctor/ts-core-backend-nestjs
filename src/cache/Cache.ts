import { Events } from 'cache-manager';
import { Keyv, StoredDataRaw } from 'keyv';
//
type EventEmitter = any;
type WrapOptions<T> = {
    ttl?: number | ((value: T) => number);
    refreshThreshold?: number | ((value: T) => number);
};
type WrapOptionsRaw<T> = WrapOptions<T> & {
    raw: true;
};
//

export abstract class Cache {
    abstract get: <T>(key: string) => Promise<T | null>;
    abstract mget: <T>(keys: string[]) => Promise<Array<T | null>>;
    abstract ttl: (key: string) => Promise<number | null>;
    abstract set: <T>(key: string, value: T, ttl?: number) => Promise<T>;
    abstract mset: <T>(list: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>) => Promise<Array<{
        key: string;
        value: T;
        ttl?: number;
    }>>;
    abstract del: (key: string) => Promise<boolean>;
    abstract mdel: (keys: string[]) => Promise<boolean>;
    abstract clear: () => Promise<boolean>;
    abstract on: <E extends keyof Events>(event: E, listener: Events[E]) => EventEmitter;
    abstract off: <E extends keyof Events>(event: E, listener: Events[E]) => EventEmitter;
    abstract disconnect: () => Promise<undefined>;
    abstract cacheId: () => string;
    stores: Keyv[];
    abstract wrap<T>(key: string, fnc: () => T | Promise<T>, ttl?: number | ((value: T) => number), refreshThreshold?: number | ((value: T) => number)): Promise<T>;
    abstract wrap<T>(key: string, fnc: () => T | Promise<T>, options: WrapOptions<T>): Promise<T>;
    abstract wrap<T>(key: string, fnc: () => T | Promise<T>, options: WrapOptionsRaw<T>): Promise<StoredDataRaw<T>>;
}