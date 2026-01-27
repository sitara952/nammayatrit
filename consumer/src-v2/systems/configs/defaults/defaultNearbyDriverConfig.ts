import { NearbyDriversConfig } from '@/src-v2/systems/configs/types';

export const defaultNearbyDriversConfig: NearbyDriversConfig = {
    autoCategorySplitPercent: 50,
    closeRangeDriversPercent: 60,
    vehicleLimit: 15,
    refreshInterval: 30000,
    radius: 1000,
    enabled: true,
    androidEnabled: false,
};
