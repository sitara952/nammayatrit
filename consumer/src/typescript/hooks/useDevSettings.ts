import { NativeModules } from 'react-native';
import Config from 'react-native-config';
const { AppInfoModule } = NativeModules;

export interface DevSettingsDetails {
    hasDevSettings: boolean;
    details: {
        developerMode: boolean;
        usbDebugging: boolean;
        wifiDebugging: boolean;
    };
}

export const useDevSettings = () => {
    const getDevSettings = async () => {
        const isDebug = Config['SDK_ENV'] != 'production';

        if (typeof AppInfoModule.isDevSettingsEnabled === 'function' && !isDebug) {
            try {
                const devSettings = await AppInfoModule.isDevSettingsEnabled();
                if (
                    devSettings.isDeveloperModeEnabled ||
                    devSettings.isUsbDebuggingEnabled ||
                    devSettings.isWifiDebuggingEnabled
                ) {
                    return {
                        hasDevSettings: true,
                        details: {
                            developerMode: devSettings.isDeveloperModeEnabled,
                            usbDebugging: devSettings.isUsbDebuggingEnabled,
                            wifiDebugging: devSettings.isWifiDebuggingEnabled,
                        },
                    };
                }
            } catch (error) {
                console.error('Failed to check developer settings:', error);
            }
        }
        const defaultdata: DevSettingsDetails = {
            hasDevSettings: false,
            details: {
                developerMode: false,
                usbDebugging: false,
                wifiDebugging: false,
            },
        };
        return defaultdata;
    };

    return {
        getDevSettings,
    };
};
