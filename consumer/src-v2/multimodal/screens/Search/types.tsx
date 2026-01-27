import { transitValues } from './constants';

export type TransitTypes =
    | (typeof transitValues)['combinational']
    | (typeof transitValues)['bus']
    | (typeof transitValues)['metro']
    | (typeof transitValues)['train'];

export type TransitDataValuesType = {
    transit: TransitTypes;
    value: boolean;
    selectedBusRoutes: string[] | undefined;
};

// Define the structure for our toggles
export type TogglesState = {
    busTransit: boolean | undefined;
    metroTransit: boolean | undefined;
    trainTransit: boolean | undefined;
};

export type TransportationTypes = 'walking' | 'metro' | 'bus' | 'train' | 'auto' | 'parking';

export type SEARCH_RESULT = {
    title: string;
    subtitle: string;
    icon: React.JSX.Element;
    distance: string;
    routeCode: string | undefined;

    transitModes: { mode: TransportationTypes; busName: string | undefined; duration: number | undefined }[];
};
