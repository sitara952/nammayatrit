interface CacheItem<T> {
    value: T;
    expiry: number | null;
}

export class InMemoryCache {
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    private cache: Map<string, CacheItem<any>>;
    private cleanupInterval: number | null;
    private defaultTTL: number | null;

    /**
     * Creates a new InMemoryCache instance
     * @param options Configuration options
     * @param options.cleanupInterval Interval in ms to clean expired items (default: 60000 - 1 minute)
     * @param options.defaultTTL Default TTL in ms for cache items (default: null - no expiration)
     */
    constructor(options: { cleanupInterval: number | undefined; defaultTTL: number | undefined } | undefined) {
        this.cache = new Map();
        this.defaultTTL = options?.defaultTTL ?? null;
        this.cleanupInterval = options?.cleanupInterval ?? 60000;

        // Start the cleanup timer if an interval is specified
        if (this.cleanupInterval) {
            setInterval(() => this.cleanup(), this.cleanupInterval);
        }
    }

    /**
     * Sets a value in the cache with optional TTL
     * @param key The cache key
     * @param value The value to store
     * @param ttl Time to live in milliseconds, null for no expiration
     */
    set<T>(key: string, value: T, ttl: number | null): void {
        const expiry =
            ttl !== undefined
                ? ttl === null
                    ? null
                    : Date.now() + ttl
                : this.defaultTTL
                  ? Date.now() + this.defaultTTL
                  : null;

        this.cache.set(key, {
            value,
            expiry,
        });
    }

    /**
     * Retrieves a value from the cache
     * @param key The cache key
     * @returns The value or undefined if not found or expired
     */
    get<T>(key: string): T | undefined {
        const item = this.cache.get(key);

        if (!item) {
            return undefined;
        }

        // Check if the item has expired
        if (item.expiry !== null && Date.now() > item.expiry) {
            this.cache.delete(key);
            return undefined;
        }

        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        return item.value as T;
    }

    /**
     * Checks if a key exists in the cache and is not expired
     * @param key The cache key
     * @returns True if the key exists and is not expired
     */
    has(key: string): boolean {
        const item = this.cache.get(key);

        if (!item) {
            return false;
        }

        // Check if the item has expired
        if (item.expiry !== null && Date.now() > item.expiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Deletes a key from the cache
     * @param key The cache key
     * @returns True if the key was found and deleted
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Updates the expiration time for an existing key
     * @param key The cache key
     * @param ttl New TTL in milliseconds, null for no expiration
     * @returns True if the key was found and updated
     */
    expire(key: string, ttl: number | null): boolean {
        const item = this.cache.get(key);

        if (!item) {
            return false;
        }

        // Update the expiry time
        // eslint-disable-next-line functional/immutable-data
        item.expiry = ttl === null ? null : Date.now() + ttl;
        return true;
    }

    /**
     * Gets the remaining TTL for a key in milliseconds
     * @param key The cache key
     * @returns Remaining TTL in ms, -1 if no expiration, -2 if key doesn't exist
     */
    ttl(key: string): number {
        const item = this.cache.get(key);

        if (!item) {
            return -2; // Key doesn't exist (Redis compatible)
        }

        if (item.expiry === null) {
            return -1; // Item doesn't expire (Redis compatible)
        }

        const remaining = item.expiry - Date.now();

        // If already expired, delete and return -2
        if (remaining <= 0) {
            this.cache.delete(key);
            return -2;
        }

        return remaining;
    }

    /**
     * Removes all items from the cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Gets all keys in the cache
     * @returns Array of cache keys
     */
    keys(): string[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Cleans up expired items from the cache
     * @returns Number of items removed
     */
    cleanup(): number {
        const now = Date.now();
        let mutableRemoved = 0;

        for (const [key, item] of this.cache.entries()) {
            if (item.expiry !== null && now > item.expiry) {
                this.cache.delete(key);
                mutableRemoved++;
            }
        }

        return mutableRemoved;
    }

    /**
     * Gets the number of items in the cache
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Sets multiple values in the cache
     * @param entries Array of [key, value] tuples
     * @param ttl Optional TTL in milliseconds
     */
    mset<T>(entries: [string, T][], ttl: number | null): void {
        for (const [key, value] of entries) {
            this.set(key, value, ttl);
        }
    }

    /**
     * Gets multiple values from the cache
     * @param keys Array of keys to retrieve
     * @returns Array of values or undefined if key not found/expired
     */
    mget<T>(keys: string[]): (T | undefined)[] {
        return keys.map(key => this.get<T>(key));
    }
}

// Singleton instance
export const globalCache = new InMemoryCache({
    cleanupInterval: 60000, // 1 minute cleanup
    defaultTTL: 300000, // 5 minutes default TTL
});

export default InMemoryCache;
