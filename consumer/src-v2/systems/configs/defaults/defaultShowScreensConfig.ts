import { appName } from 'config-types';
import { ShowScreenConfig } from '../types';

const defaultScreenConfig: ShowScreenConfig = {
    showScreens: true,
};

export const defaultShowScreensConfig: Record<appName, ShowScreenConfig> = {
    odishaYatri: defaultScreenConfig,
    nammaYatri: defaultScreenConfig,
    manaYatri: defaultScreenConfig,
    yatri: defaultScreenConfig,
    yatriSathi: defaultScreenConfig,
    keralaSavaari: defaultScreenConfig,
    bridge: defaultScreenConfig,
    anna: defaultScreenConfig,
    bharatTaxi: defaultScreenConfig,
};
