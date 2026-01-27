import { appName } from 'config-types';
import { ShowScreenConfig } from '../types';

export const defaultShowVideoScreens: Record<appName, ShowScreenConfig> = {
    odishaYatri: { showScreens: false },
    nammaYatri: { showScreens: false },
    manaYatri: { showScreens: false },
    yatri: { showScreens: false },
    yatriSathi: { showScreens: false },
    keralaSavaari: { showScreens: false },
    bridge: { showScreens: false },
    anna: { showScreens: false },
    bharatTaxi: { showScreens: false },
};
