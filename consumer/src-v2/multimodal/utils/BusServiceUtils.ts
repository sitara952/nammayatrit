import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import mtIcAcService from '../../assets/3D-assets/bus-tier/mt_ic_ac_service.webp';
import mtIcDeluxeService from '../../assets/3D-assets/bus-tier/mt_ic_deluxe_service.webp';
import mtIcExpressService from '../../assets/3D-assets/bus-tier/mt_ic_express_service.webp';
import mtIcOrdinaryBusService from '../../assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import mtIcMultimodalMetro from '../../assets/mt_ic_multimodal_metro.webp';
import mtIcMultimodalTrainService from '../../assets/mt_ic_multimodal_train.webp';
import { strings } from 'config-types';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { isUndefined } from 'lodash';

type ServiceType = 'AC' | 'EXECUTIVE' | 'SPECIAL' | 'EXPRESS' | 'ORDINARY' | 'NON_AC' | string | undefined;

export const getServiceTierImage = (mode: VehicleCategory_vehicleCategory, serviceType: ServiceType | undefined) => {
    if (mode === 'SUBWAY') {
        return mtIcMultimodalTrainService;
    }
    if (mode === 'METRO') {
        return mtIcMultimodalMetro;
    }
    switch (serviceType) {
        case 'AC':
            return mtIcAcService;
        case 'EXECUTIVE':
        case 'SPECIAL':
            // Deluxe
            return mtIcDeluxeService;
        case 'EXPRESS':
            // Express
            return mtIcExpressService;
        case 'ORDINARY':
            // Ordinary
            return mtIcOrdinaryBusService;
        default:
            // Default to Ordinary
            return mtIcOrdinaryBusService;
    }
};

export const getUserLanguageStringsForMode = (mode: string, userLanguageStrings: strings) => {
    if (mode.toLowerCase() === 'bus') {
        return userLanguageStrings.bus;
    }
    if (mode.toLowerCase() === 'metro') {
        return userLanguageStrings.Metro;
    }
    if (mode.toLowerCase() === 'subway') {
        return userLanguageStrings.Train;
    }
    if (mode.toLowerCase() === 'train') {
        return userLanguageStrings.Train;
    }
    if (mode.toLowerCase() === 'walk') {
        return userLanguageStrings.Walk;
    }
    if (mode.toLowerCase() === 'taxi') {
        return userLanguageStrings.Taxi;
    }
    if (mode.toLowerCase() === 'auto') {
        return userLanguageStrings.Auto;
    }
    return mode;
};

export const hasBusTicket = (journeyLegs: legInfo[]): boolean => {
    const busLegs = journeyLegs.filter(item => item?.travelMode === 'Bus' && item?.legExtraInfo.TAG === 'Bus');
    const busLegExtraInfos = busLegs.map(busLeg => busLeg.legExtraInfo._0);

    const encryptedTicketDatas = busLegExtraInfos.map(busLegExtraInfo => {
        // Type check to ensure we have a subway leg with tickets property
        if ('tickets' in busLegExtraInfo) {
            return busLegExtraInfo.tickets?.[0] && busLegExtraInfo;
        }
        return undefined;
    });
    return (
        encryptedTicketDatas.length > 0 &&
        encryptedTicketDatas.some(ticketData => {
            return !isUndefined(ticketData);
        })
    );
};
