import {
    FRFSServiceTierType_fRFSServiceTierType,
    MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';

export type TierOption = {
    name: string;
    value: FRFSServiceTierType_fRFSServiceTierType;
};

export interface TransitPreferencesState {
    allowedTransitModes: MultimodalTravelMode_multimodalTravelMode[];
    busTransitTypes: FRFSServiceTierType_fRFSServiceTierType[];
    subwayTransitTypes: FRFSServiceTierType_fRFSServiceTierType[];
}

export const BUS_TIERS: TierOption[] = [
    { name: 'Ordinary', value: 'ORDINARY' },
    { name: 'Express', value: 'EXPRESS' },
    { name: 'Deluxe', value: 'EXECUTIVE' },
    { name: 'AC', value: 'AC' },
];

export const SUBWAY_TIERS: TierOption[] = [
    { name: 'First Class', value: 'FIRST_CLASS' },
    { name: 'Second Class', value: 'SECOND_CLASS' },
    // { name: 'Third Class', value: 'THIRD_CLASS' },
];
