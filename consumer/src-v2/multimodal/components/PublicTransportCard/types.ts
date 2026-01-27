import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';

export type TransitType = 'walk' | 'metro' | 'metroNoleaf' | 'bus' | 'train' | 'auto' | 'taxi' | 'bike';

export type TransitSegmentType = {
    type: TransitType;
    duration: number | null;
};

export type TransitSegmentProps = {
    journey: TransitSegmentType[];
    duration: string | undefined;
};

export const mapModeToTransitType = (
    mode: MultimodalTravelMode_multimodalTravelMode,
    serviceTierName: string | undefined,
): TransitType => {
    switch (mode) {
        case 'Bus':
            return 'bus';
        case 'Metro':
            return 'metro';
        case 'Taxi':
            return serviceTierName?.toLowerCase().includes('auto') || serviceTierName === undefined
                ? 'auto'
                : serviceTierName?.toLowerCase().includes('bike')
                  ? 'bike'
                  : 'taxi';
        case 'Walk':
            return 'walk';
        case 'Subway':
            return 'train';
    }
};
