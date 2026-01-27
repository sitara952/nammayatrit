import { appName } from 'config-types';
import { AppBasedOnboarding } from '../types';

export const defaultAppBasedOnboarding: Record<appName, AppBasedOnboarding> = {
    odishaYatri: 'NO_MULTIMODAL',
    nammaYatri: 'NAMMA_TRANSIT',
    manaYatri: 'NO_MULTIMODAL',
    yatri: 'NO_MULTIMODAL',
    yatriSathi: 'NO_MULTIMODAL',
    keralaSavaari: 'NO_MULTIMODAL',
    bridge: 'NAMMA_TRANSIT',
    anna: 'MULTIMODAL',
    bharatTaxi: 'NO_MULTIMODAL',
};
