import { Configs } from './types';

export interface ConfigProvider {
    initialize(): Promise<void>;
    fetchConfigs(): Promise<void>;
    getConfig<T extends keyof Configs>(key: T): Configs[T] | undefined;
}
