import { ConfigClient, ClientOptions } from 'config-types';
import React, { useRef } from 'react';
import RNFS from 'react-native-fs';
import { useAppSelector } from '../state/hooks';
import { selectUserProfileLanguage } from '../state/client/user';
import { selectAppThemeName, selectOperatingCity } from '../state/client/session';
import { createMMKV } from '@/utils/mmkvUtils';
import Config from 'react-native-config';

const ConfigContext = React.createContext<ConfigClient | undefined>(undefined);

const useConfigContext = (): ConfigClient => {
    const context = React.useContext(ConfigContext);
    if (!context) {
        throw new Error(
            'useConfigContext: `ConfigContext` is undefined. Seems you forgot to wrap component within the ConfigProvider',
        );
    }

    return context;
};

const ConfigProvider: React.FC<Partial<ConfigClient & { children: React.ReactNode }>> = props => {
    const { children, factors } = props;
    const configManagerRef = useRef<ConfigClient | undefined>(undefined);
    if (configManagerRef.current === undefined) {
        console.info('ConfigClient instance created');
        const storage = createMMKV();
        const clientOptions: ClientOptions = {
            storage: storage,
            fileHandle: {
                writeFile: RNFS.writeFile,
                readFile: RNFS.readFile,
                baseDir: RNFS.DocumentDirectoryPath,
            },
            configURL: Config['CONFIG_URL'],
        };
        configManagerRef.current = new ConfigClient(clientOptions, factors);
    }
    const language = useAppSelector(selectUserProfileLanguage);
    const city = useAppSelector(selectOperatingCity);
    const appName = factors?.appName;
    const theme = useAppSelector(selectAppThemeName);

    const bc_theme = theme == 'light' || theme == 'dark' ? theme : 'light';
    const updatedFactors = {
        language: language,
        city: city,
        theme: bc_theme,
        appName: appName,
    };
    configManagerRef.current && configManagerRef.current.updateFactors(updatedFactors);

    return (
        <>
            {configManagerRef.current ? (
                <ConfigContext.Provider value={configManagerRef.current}>{children}</ConfigContext.Provider>
            ) : null}
        </>
    );
};

export { ConfigProvider, useConfigContext };
