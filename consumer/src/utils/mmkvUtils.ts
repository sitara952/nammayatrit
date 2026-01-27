import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

type Listener = (key: string) => void;

/**
 * AsyncStorageWrapper - Persistent fallback for MMKV when JSI is not available
 * Uses AsyncStorage which works with remote debugging
 * Maintains synchronous interface for compatibility with MMKV
 * Implemented as a singleton to maintain global state
 * Populates in-memory cache during initialization from AsyncStorage
 */
export class AsyncStorageWrapper {
    private static _instance: AsyncStorageWrapper | null = null;
    private listeners: Listener[] = [];
    private cache: { [key: string]: string | undefined } = {};
    private initialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private readonly KEYS_METADATA_KEY = '__MMKV_WRAPPER_KEYS__';

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): AsyncStorageWrapper {
        if (AsyncStorageWrapper._instance === null) {
            // eslint-disable-next-line functional/immutable-data
            AsyncStorageWrapper._instance = new AsyncStorageWrapper();
        }
        return AsyncStorageWrapper._instance;
    }

    getString(key: string): string | undefined {
        console.info('AsyncStorageWrapper: getString', key, this.cache[key]);
        return this.cache[key];
    }

    set(key: string, value: string | boolean | number): void {
        const stringValue = typeof value === 'string' ? value : String(value);
        // Update cache immediately for synchronous access
        this.cache = { ...this.cache, [key]: stringValue };
        this.notifyListeners(key);

        // Update the keys metadata
        this.updateKeysMetadata(key);

        // Perform async storage operation
        AsyncStorage.setItem(key, stringValue)
            .then(() => {
                console.info('AsyncStorage set key successfully', key, stringValue);
            })
            .catch((error: unknown) => {
                console.warn('AsyncStorage set failed:', error);
            });
    }

    delete(key: string): void {
        // Update cache immediately
        const { [key]: _removed, ...rest } = this.cache;
        this.cache = rest;
        this.notifyListeners(key);

        // Update the keys metadata
        this.removeKeyFromMetadata(key);

        // Perform async storage operation
        AsyncStorage.removeItem(key).catch((error: unknown) => {
            console.warn('AsyncStorage delete failed:', error);
        });
    }

    clearAll(): void {
        // Update cache immediately
        this.cache = {};
        this.notifyListeners('*');

        // Clear the keys metadata
        this.clearKeysMetadata();

        // Perform async storage operation
        AsyncStorage.clear().catch((error: unknown) => {
            console.warn('AsyncStorage clearAll failed:', error);
        });
    }

    getAllKeys(): string[] {
        return Object.keys(this.cache);
    }

    contains(key: string): boolean {
        return key in this.cache;
    }

    // Boolean support
    getBoolean(key: string): boolean | undefined {
        const value = this.cache[key];
        if (value === undefined) return undefined;
        return value === 'true';
    }

    setBoolean(key: string, value: boolean): void {
        this.set(key, value);
    }

    // Number support
    getNumber(key: string): number | undefined {
        const value = this.cache[key];
        if (value === undefined) return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    }

    setNumber(key: string, value: number): void {
        this.set(key, value);
    }

    addOnValueChangedListener(listener: Listener): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners(key: string): void {
        this.listeners.forEach(listener => listener(key));
    }

    /**
     * Update the keys metadata when a new key is added
     */
    private async updateKeysMetadata(key: string): Promise<void> {
        try {
            const existingKeysJson = await AsyncStorage.getItem(this.KEYS_METADATA_KEY);
            const existingKeys: string[] = safeJsonParse(existingKeysJson, [], 'MMKV keys metadata');

            if (!existingKeys.includes(key)) {
                const updatedKeys = [...existingKeys, key];
                await AsyncStorage.setItem(this.KEYS_METADATA_KEY, JSON.stringify(updatedKeys));
            }
        } catch (error: unknown) {
            console.warn('Failed to update keys metadata:', error);
        }
    }

    /**
     * Remove a key from the metadata when it's deleted
     */
    private async removeKeyFromMetadata(key: string): Promise<void> {
        try {
            const existingKeysJson = await AsyncStorage.getItem(this.KEYS_METADATA_KEY);
            const existingKeys: string[] = safeJsonParse(existingKeysJson, [], 'MMKV keys metadata');

            const updatedKeys = existingKeys.filter(k => k !== key);
            await AsyncStorage.setItem(this.KEYS_METADATA_KEY, JSON.stringify(updatedKeys));
        } catch (error: unknown) {
            console.warn('Failed to remove key from metadata:', error);
        }
    }

    /**
     * Clear the keys metadata
     */
    private async clearKeysMetadata(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.KEYS_METADATA_KEY);
        } catch (error: unknown) {
            console.warn('Failed to clear keys metadata:', error);
        }
    }

    /**
     * Initialize cache by populating from AsyncStorage
     * This should be called once when the wrapper is created
     */
    async initializeCache(): Promise<void> {
        if (this.initialized) {
            return; // Already initialized
        }

        if (this.initializationPromise) {
            return this.initializationPromise; // Return existing promise
        }

        this.initializationPromise = this._initializeCache();
        return this.initializationPromise;
    }

    private async _initializeCache(): Promise<void> {
        try {
            console.info('AsyncStorageWrapper: Starting cache initialization...');

            // Get the list of stored keys from metadata
            const keysJson = await AsyncStorage.getItem(this.KEYS_METADATA_KEY);
            // eslint-disable-next-line functional/no-let
            let keys: string[] = safeJsonParse(keysJson, [], 'MMKV keys metadata');

            console.info(`AsyncStorageWrapper: Found ${keys.length} keys to load: ${keys.join(', ')}`);

            if (keys.includes('persist:root')) {
                // eslint-disable-next-line functional/immutable-data
                keys.splice(keys.indexOf('persist:root'), 1);
                // eslint-disable-next-line functional/immutable-data
                keys.unshift('persist:root');

                keys = ['persist:root', 'persist:session', 'persist:clientVariant'];
            }

            // Load each key into the cache
            const loadPromises = keys.map(async key => {
                try {
                    const value = await AsyncStorage.getItem(key);
                    if (value !== null) {
                        this.cache = { ...this.cache, [key]: value };
                    }
                } catch (error: unknown) {
                    console.warn(`Failed to load key ${key}:`, error);
                }
            });

            await Promise.all(loadPromises);

            console.info(`AsyncStorageWrapper: Cache initialized with ${Object.keys(this.cache).length} items`);

            this.initialized = true;
        } catch (error: unknown) {
            console.warn('AsyncStorageWrapper initialization failed:', error);

            this.initialized = true; // Mark as initialized even if failed
        }
    }

    /**
     * Check if the wrapper is initialized
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Reset the singleton instance (useful for testing)
     */
    public static resetInstance(): void {
        // eslint-disable-next-line functional/immutable-data
        AsyncStorageWrapper._instance = null;
    }
}

/**
 * Creates an MMKV instance with automatic fallback to AsyncStorage
 * when MMKV fails (e.g., during remote debugging)
 * The AsyncStorageWrapper is a singleton to maintain global state
 */
export function createMMKV(): MMKV | AsyncStorageWrapper {
    if (!__DEV__) {
        return new MMKV();
    } else {
        try {
            return new MMKV();
        } catch (error: unknown) {
            console.warn('MMKV initialization failed, using AsyncStorage fallback:', error);

            // Check if this is due to remote debugging
            if (error instanceof Error && error.message.includes('React Native is not running on-device')) {
                console.warn('Remote debugging detected. Using AsyncStorage fallback.');
                console.warn('Storage will be persistent with in-memory cache populated during initialization.');
            }

            const wrapper = AsyncStorageWrapper.getInstance();
            // Initialize the cache asynchronously (only once)
            wrapper.initializeCache().catch(console.warn);
            return wrapper;
        }
    }
}

/**
 * Type alias for the MMKV instance (either real MMKV or AsyncStorageWrapper)
 */
export type MMKVInstance = MMKV | AsyncStorageWrapper;
