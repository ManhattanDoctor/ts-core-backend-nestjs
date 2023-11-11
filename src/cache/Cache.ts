import { Store, WrapTTL, Milliseconds, Cache as CaseBase } from 'cache-manager';

export abstract class Cache<S extends Store = Store> implements CaseBase<S> {
    abstract set: (key: string, value: unknown, ttl?: Milliseconds) => Promise<void>;
    abstract get: <T>(key: string) => Promise<T | undefined>;
    abstract del: (key: string) => Promise<void>;
    abstract reset: () => Promise<void>;
    abstract wrap<T>(key: string, fn: () => Promise<T>, ttl?: WrapTTL<T>): Promise<T>;
    store: S;
}