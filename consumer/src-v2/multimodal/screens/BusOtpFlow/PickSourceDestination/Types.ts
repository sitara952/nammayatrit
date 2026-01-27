import { transportStation } from '../../../../../src/readOnly/api/types/PublicTransportData.gen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../../../../../src/typescript/navigation/globalParamList';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { JourneyDetailsProps } from '../../JourneyInfoScreen';
import { FRFSServiceTierType_fRFSServiceTierType } from '@/readOnly/api/types/Enums.gen';

// Define proper types for journey-related data
export interface JourneyInfoData {
    legs: legInfo[];
    estimatedDuration: number;
    journeyId: string;
    // Add other properties as needed
}

export interface PaymentProps {
    legs: legInfo[];
    journeyId?: string;
    fetchingLegsFare: boolean;
    isJourneyConfirmed: boolean;
    loadingDataForLeg: number | null;
    handledQuoteExpiry: () => void;
    setIsJourneyConfirmed: (value: boolean) => void;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    onMoreOptions: undefined;
    isSingleMode: boolean;
}

export interface PickSourceDestinationProps {
    otp: string;
    busNumber: string | null;
    stops: transportStation[];
    selectedSource: transportStation | null;
    selectedDestination: transportStation | null;
    onSourceSelect: (station: transportStation) => void;
    onDestinationSelect: (station: transportStation) => void;
    onProceed: () => void;
}

export interface PickSourceDestinationViewState {
    otp: string;
    busNumber: string | null;
    stops: transportStation[];
    selectedSource: transportStation | undefined;
    selectedDestination: transportStation | undefined;
    sourceStopsList: transportStation[];
    destinationStopsList: transportStation[];
    frequentVisitDestinations: transportStation[];
    mpDispatch: (action: PickSourceDestinationAction) => void;
    detectedRouteCode: string | null;
    onGoBack: () => void;
    // Journey-related properties
    correctedJourneyInfoData: JourneyInfoData;
    currentJourney: journeyData | null;
    currentLocation: location | null;
    publicTransportSearch: JourneyDetailsProps | undefined;
    searchId: string | null;
    isSingleMode: boolean;
    isJourneyConfirmed: boolean;
    loadingDataForLeg: number | null;
    setLoadingDataForLeg: (loading: number | null) => void;
    setIsJourneyConfirmed: (value: boolean) => void;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    onMoreOptions: undefined;
    fetchingLegsFare: boolean;
    isSwitchRouteEnabled: boolean;
    // FRFS route data status
    frfsRouteDataError: string | null;
    frfsRouteDataLoading: boolean;
    // Reverse route information
    currentRouteCode: string;
    hasReverseRoute: boolean;
    isSwitchingToReverse: boolean;
    serviceType: FRFSServiceTierType_fRFSServiceTierType | undefined;
    serviceTypeName: string | undefined;
}

export type PickSourceDestinationAction =
    | { type: 'SELECT_SOURCE'; payload: { station: transportStation; selectedSourceIndex: number } }
    | { type: 'SELECT_DESTINATION'; payload: { station: transportStation } }
    | { type: 'PROCEED'; payload: undefined }
    | { type: 'EDIT_BUS'; payload: undefined }
    | { type: 'UNSET_SOURCE_DESTINATION'; payload: undefined }
    | { type: 'SWITCH_ROUTE'; payload: undefined };
