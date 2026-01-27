import type { DetailedLiveHeaderProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/DetailedLiveHeader';
import type { CurrentLegSplitUpProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/CurrentLegSplitUp';
import type { MiniBusTrackingProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/MiniBusTracking';
import type { AdditionalBusInfoProps as ImportedAdditionalBusInfoProps } from '@/src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/components/MiniTransitInfo'; // Path based on PreboardingState.tsx
import type { RateTransitProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/RateTransit'; // Path based on InTransitState.tsx
import type { InStationZoneProps as OriginalInStationZoneProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/InZoneExperience/InStationZone';
import type {
    TransitMode,
    UserState,
    VehicleState,
    ProcessedLegInfo,
    RiderLocationState,
    TrackedLegInfoStaticInfo,
} from '@/src-v2/multimodal/types/journeyTracking';
import type { DetailedTransitTrackingUIProps } from '@/src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/DetailedTransitTrackingUI';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { JourneyId } from '@/typescript/state/client/user';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { TransitCheckInProps } from '../NewLiveJourney/components/StatusPopUpModal/TransitCheckIn/TransitCheckIn';
import { TicketUIProps } from '../Ticket/SingleTicket/types';
import { BookAutoToastProps } from '../NewLiveJourney/components/BookAuto/BookAutoToast';
import { CallDriverProps } from '../LiveJourneyOverview/UI';
import { NewTimeTableUIProps } from '../NewTimeTable/types';
import { PreboardingMetroProps } from '../NewLiveJourney/molecules/PreboardingMetro';
import { NextWalkLegInfoProps } from '../NewLiveJourney/components/NextWalkLegInfo/NextWalkLegInfo';
import { NextPubicLegInfoProps } from '../NewLiveJourney/components/NextPubicLegInfo/NextPubicLegInfo';
import { TransitType } from '../NewLiveJourney/components/Iternary/types';
import { LegUpdateType } from '../NewLiveJourney/components/UpdateJourney/JourneyListBottomSheet';
import { LocationWithTimestamp } from '../../hooks/useRiderLocation';
import { Stop } from '../../types/journeyTracking';

// Re-exporting or defining AdditionalBusInfoProps if it's used by Flow.tsx directly
export type AdditionalBusInfoProps = ImportedAdditionalBusInfoProps;

// Add onPressTrackMode to component prop types
export type InStationZoneProps = OriginalInStationZoneProps & {
    onPressTrackMode: (() => void) | undefined;
    onShowTicketPress: (() => void) | undefined; // Added for ShowTicketButton & fixed lint
};
// --- PreboardingState Props (derived from PreboardingState.tsx) ---
export type BasePreboardingProps = {
    // Exported
    detailedLiveHeaderProps: DetailedLiveHeaderProps;
    isLastLeg: boolean;
    isLiveTrackingNotAvailable: boolean;
    mode: 'metro' | 'bus' | 'train'; // Added mode as it's base
    onPressTrackMode: (() => void) | undefined;
    isLoading: boolean;
    isBusTicketNotActivated: boolean;
    onPressVerifyPass: () => void;
    hasApplicablePasses: boolean | undefined;
    onPressBusOtpScreen: () => void;
};

type RideSkippedStateProps = BasePreboardingProps & {
    status: 'rideSkipped';
    onPressRebookSkippedLeg: () => void;
    isButtonLoading: boolean;
};

type StartingStateProps = BasePreboardingProps & {
    status: 'starting';
    currentLegSplitUpProps: CurrentLegSplitUpProps;
    handleOnPressViewTicketButton: () => void;
    onPressBookRide: () => void;
};

/**
 * Props for the initial taxi starting state of preboarding
 */
type TaxiStartingStateProps = BasePreboardingProps & {
    /** Indicates the starting status of the journey */
    status: 'taxiStarting';
    /** Props for displaying the current leg's split-up information */
    currentLegSplitUpProps: CurrentLegSplitUpProps;
    /** Callback when book ride button is pressed */
    onPressRideDetails: () => void;
};

type WalkingStateProps = BasePreboardingProps & {
    status: 'walking';
    isInsideSpecialZone: boolean;
    onPressViewTicketButton: () => void;
    onPressSwitchToAuto: () => void;
    onPressBookRide: () => void;
    isButtonLoading: boolean;
};

type WaitingStateProps = {
    status: 'waiting';
    handleOnPressViewTicketButton: () => void;
} & (
    | (BasePreboardingProps & { mode: 'bus'; miniBusTrackingProps: MiniBusTrackingProps })
    | (BasePreboardingProps & { mode: 'metro' | 'train'; currentLegSplitUpProps: CurrentLegSplitUpProps })
);

type TransitOneStopAwayStateProps = BasePreboardingProps & {
    status: 'transitIsOneStopAway';
    additionalBusInfoProps: AdditionalBusInfoProps;
    handleOnPressViewTicketButton: () => void;
};

type TransitArrivedStateProps = BasePreboardingProps & {
    status: 'transitArrived';
    additionalBusInfoProps: AdditionalBusInfoProps;
    handleOnPressViewTicketButton: () => void;
};

export type PreboardingStateScreenProps = // Renamed to avoid conflict if PreboardingStateProps is imported
    (
        | RideSkippedStateProps
        | StartingStateProps
        | TaxiStartingStateProps
        | WalkingStateProps
        | WaitingStateProps
        | TransitOneStopAwayStateProps
        | TransitArrivedStateProps
    ) & {
        onPressTrackMode: (() => void) | undefined; // Ensure it's on the union type as well
    };

export type NextLegProps =
    | ({ mode: 'Taxi' } & BookAutoToastProps)
    | ({ mode: 'Walk' } & NextWalkLegInfoProps)
    | ({ mode: 'Metro' } & NextPubicLegInfoProps)
    | ({ mode: 'Subway' } & NextPubicLegInfoProps)
    | ({ mode: 'Bus' } & NextPubicLegInfoProps)
    | undefined;

// --- InTransitState Props (derived from InTransitState.tsx) ---
type BaseInTransitStateProps = {
    mode: 'metro' | 'train';
    detailedLiveHeaderProps: DetailedLiveHeaderProps;
    nextLegProps: NextLegProps;
};

type InTransitProps = BaseInTransitStateProps & {
    status: 'inTransit'; // Corrected to lowercase 'i' as per InTransitState.tsx
    miniBusTrackingProps: MiniBusTrackingProps;
    onShowTicketPress: (() => void) | undefined; // Added for ShowTicketButton and fixed lint error
    onPressExitStation: (() => void) | undefined;
    onVerifyPass: (() => void) | undefined;
    hasApplicablePasses: boolean | undefined;
    journeyId: JourneyId;
};

type ExitStationProps = BaseInTransitStateProps & {
    status: 'exitStation';
    exitGateNo: string | undefined;
    exitGateSide: string | undefined;
    onShowTicketPress: (() => void) | undefined;
    onCompleteJourney: () => Promise<void>;
    onMarkLegComplete: () => Promise<void>;
    journeyId: JourneyId;
    hasNextLeg: boolean;
};

type CloseToDestinationProps = BaseInTransitStateProps & {
    status: 'closeToDestination';
    onShowTicketPress: (() => void) | undefined;
    onPressExitStation: () => void;
    journeyId: JourneyId;
};

type DestinationReachedProps = BaseInTransitStateProps & {
    status: 'destinationReached'; // Corrected to lowercase 'd'
    isSingleMode: boolean;
} & (
        | {
              isSingleMode: true;
              rateTransitProps: RateTransitProps;
          }
        | {
              isSingleMode: false;
              nextTransitInfo: string;
              handleOnPressGoToNextTransit: () => void;
          }
    );

export type InTransitStateScreenProps =
    | InTransitProps
    | ExitStationProps
    | CloseToDestinationProps
    | DestinationReachedProps; // Renamed

// --- ChooseRideState Props ---
export type ChooseRideStateProps = {
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    rideOptionsLeg: ProcessedLegInfo | undefined;
};
export type GoogleMapsButtonProps = {
    additionalOffset: number | undefined;
    riderLocation: RiderLocationState;
    destination: TrackedLegInfoStaticInfo['destination'];
};
// --- LiveJourneyDetail Screen Types ---
export type LiveJourneyDetailViewMode = 'preboarding' | 'intransit' | 'chooseRide' | 'waitingStation';

export interface LiveJourneyDetailViewData {
    callDriverProps: CallDriverProps | null;
    callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    viewMode: LiveJourneyDetailViewMode;
    backgroundMode: 'map' | 'inTransitBackground' | 'inStationBackground';
    shouldShowBottomSheet: boolean;
    transitMode?: TransitMode; // Optional because it might not be available in loading/error states
    userState?: UserState; // Optional
    vehicleState?: VehicleState; // Optional
    currentLeg?: ProcessedLegInfo;
    detailedLiveHeaderProps?: DetailedLiveHeaderProps;
    waitingStationProps?: PreboardingMetroProps;
    preboardingProps?: PreboardingStateScreenProps; // Use the new detailed type
    inTransitProps?: InTransitStateScreenProps; // Use the new detailed type
    chooseRideProps?: ChooseRideStateProps;
    inStationZoneProps?: InStationZoneProps; // Now includes onPressTrackMode
    googleMapsButtonProps?: GoogleMapsButtonProps;
    lastUpdatedAtString: string | undefined;
    errorMessage?: string;
    isLastMile: boolean;
    ticketUIProps: TicketUIProps | undefined; // Added to pass all journey legs

    // Props for DetailedTransitTrackingUI
    showDetailedTransitTracking: boolean;
    detailedTransitTrackingComponentProps?: DetailedTransitTrackingUIProps;
    transitCheckInProps?: TransitCheckInProps;
    onShowDetailedTransitTracking: () => void;
    onHideDetailedTransitTracking: () => void;

    // Handlers
    onPressExit?: () => void;
    onPressSafety?: () => void;
    recenterMap: () => void;
    timeTableProps?: NewTimeTableUIProps;
    goBackToOverviewScreen: (() => void) | undefined;
    riderLocationHistory: LocationWithTimestamp[];
    locationRefreshViewData: LocationRefreshViewData;
    metroConfirmProps: {
        allLegs: ProcessedLegInfo[];
        onMetroStationConfirm: (legOrder: string, station: Stop) => void;
    } | null;
    onCompleteJourney: (() => Promise<void>) | undefined;
    onMarkLegComplete: (() => Promise<void>) | undefined;
    onPressStatusBadge: () => void;
    predictedLeg: ProcessedLegInfo | undefined;
    shouldAutoOpenUpdateTransit: boolean;
    setShouldAutoOpenUpdateTransit: () => void;
}

interface LocationRefreshViewData {
    trackLostJourneyProps: TransitType[];
    onLegUpdate: (legUpdate: LegUpdateType) => void;
}

export interface LiveJourneyDetailUIProps {
    viewData: LiveJourneyDetailViewData;
    journeyId: JourneyId;
}

export interface LiveJourneyDetailFlowProps {
    journeyId: JourneyId;
}
