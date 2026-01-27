import { distance } from '@/readOnly/api/types/Distance.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';

// import { JourneyId } from '../../../../src/typescript/state/client/user';

export type TransitTypeLocal = { Bus: boolean; Metro: boolean; Subway: boolean; Taxi: boolean; Walk: boolean };

// Define item type
export type FilterItemType =
    | { id: string; type: 'popUp'; name: string; onPress: () => void }
    | { id: string; type: 'transit-type'; value: MultimodalTravelMode_multimodalTravelMode };

export type JourneyOptionsScreenAction =
    | Action<'FILTER_LEGS', { options: JourneyFilterOptions }>
    | Action<'GO_BACK'>
    | Action<'JOURNEY_CLICK', { JourneyId: string }>
    | Action<'NAVIGATE_TO_SEARCH_MODAL'>
    | Action<'FILTER_MODE', { options: MultimodalTravelMode_multimodalTravelMode[] }>;

export type JourneyOptionsScreenProps = {
    mpDispatch: Resolver<JourneyOptionsScreenAction>;
    publicTransportList: PublicTransportList[];
    allJourneysList: PublicTransportList[];
    isLoading: boolean;
    source: location | null;
    destination: location | null;
    filtersApplied: boolean;
};

export type JourneyFilterProps = {
    options: JourneyFilterOptions[];
    selectJourneyFilter: (option: JourneyFilterOptions) => void;
    dispatch: Resolver<JourneyOptionsScreenAction> | undefined;
};

export type JourneyInfo = {
    type: MultimodalTravelMode_multimodalTravelMode;
    routeShortName: string | null;
    alternateRouteNames: string[] | null;
    time: number | null;
    cost: number | null;
    distance: distance | null;
};

export type PublicTransportList = {
    startTime: number | undefined;
    endTime: string | undefined;
    cost: number | undefined;
    subtitle: string;
    totalTime: number | undefined;
    journeyData: JourneyInfo[];
    totalJourneys: number;
    distance: distance;
    journeyId: string;
    hasPreferredTransitModes: boolean | undefined;
    hasPreferredServiceTier: boolean | undefined;
};

export enum JourneyFilterOptions {
    Most_Relevant = 'Most Relevant',
    Quickest = 'Quickest',
    Least_Walking = 'Least Walking',
    Cheapest = 'Cheapest',
    Fewest_Transfers = 'Fewest Transfers',
}

type Distance = {
    unit: string;
    value: number;
};

export type JourneyLeg = {
    journeyLegId: string;
    journeyLegOrder: number;
    journeyLegMode: string;
    color: string | undefined;
    colorCode: string | undefined;
    distance: Distance;
    duration: number;
};

export type Journey = {
    journeyId: string;
    distance: Distance;
    duration: number;
    startTime: string;
    endTime: string;
    totalMaxFare: number;
    totalMinFare: number;
    journeyLegs: JourneyLeg[];
    modes: string[];
};
