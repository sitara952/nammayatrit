import { getRemoteConfig, setDefaults, fetchAndActivate, getValue } from '@react-native-firebase/remote-config';
import { Configs } from '../types';
import { ConfigProvider } from '../configProvider';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

type ConfigDefaults = Record<string, string>;

export default class FirebaseRemoteConfigDataSource implements ConfigProvider {
    private defaultConfig: ConfigDefaults = {};
    private configs: Partial<Configs> = {
        tracking_mode: undefined,
        feature_flags: undefined,
        carousel_banner_config: undefined,
        system_configs: undefined,
        enabled_services: undefined,
        allowed_languages: undefined,
        explore_section: undefined,
        support_number: undefined,
        enabled_services_v2: undefined,
        new_feature_flags: undefined,
    };

    // constructor(defaultConfig: Configs) {
    //   this.defaultConfig = Object.fromEntries(
    //     Object.entries(defaultConfig).map(([key, value]) => [key, JSON.stringify(value)])
    //   );
    // }
    constructor() {}

    async initialize(): Promise<void> {
        // Add default file from firebase defaults
        const remoteConfigInstance = getRemoteConfig();
        await setDefaults(remoteConfigInstance, this.defaultConfig);
    }

    // Note: This is not being used currently, need to add updated functions to fetch and start listeners
    async fetchConfigs(): Promise<void> {
        const remoteConfigInstance = getRemoteConfig();
        const activated = await fetchAndActivate(remoteConfigInstance);
        if (!activated) {
            console.warn('Failed to activate remote configs. Using default configs.');
        }

        const updatedConfigs = Object.keys(this.defaultConfig).reduce(
            (acc, key) => {
                const value = getValue(remoteConfigInstance, key).asString();
                const defaultValue = safeJsonParse(this.defaultConfig[key], {}, `defaultConfig_${key}`);
                const parsedValue = safeJsonParse(value, defaultValue, `firebaseConfig_${key}`);
                return {
                    ...acc,
                    [key]: parsedValue,
                };
            },
            { ...this.configs },
        );

        this.configs = updatedConfigs;
    }

    getConfig<T extends keyof Configs>(key: T): Configs[T] | undefined {
        return this.configs[key];
    }
}
