// Use this util file to map vehicle service tiers to various properties

import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';

// Having this now in FE until we have this info in fareAPIEntity, we can later move this to remote config if needed
export const getFreeWaitingMinutes = (serviceTier: ServiceTierType_serviceTierType): number => {
    switch (serviceTier) {
        case 'AMBULANCE_TAXI':
        case 'AMBULANCE_TAXI_OXY':
        case 'AMBULANCE_AC':
        case 'AMBULANCE_AC_OXY':
        case 'AMBULANCE_VENTILATOR':
            return 0;
        case 'COMFY':
        case 'ECO':
        case 'PREMIUM':
        case 'SUV':
        case 'AUTO_RICKSHAW':
        case 'HATCHBACK':
        case 'SEDAN':
        case 'TAXI':
        case 'TAXI_PLUS':
        case 'PREMIUM_SEDAN':
        case 'BLACK':
        case 'BLACK_XL':
        case 'BIKE':
        case 'SUV_PLUS':
        case 'DELIVERY_BIKE':
        case 'DELIVERY_LIGHT_GOODS_VEHICLE':
        case 'HERITAGE_CAB':
        case 'EV_AUTO_RICKSHAW':
        case 'AUTO_PLUS':
        case 'BIKE_PLUS':
        case 'AC_PRIORITY':
        case 'E_RICKSHAW':
        case 'UNKNOWN_SERVICE_TYPE':
        default:
            return 3;
    }
};
