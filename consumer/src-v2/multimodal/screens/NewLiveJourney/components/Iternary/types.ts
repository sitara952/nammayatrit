import { TransitMode, VehicleState, ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { JourneyId } from '@/typescript/state/client/user';
import { LocationStatus } from '@/typescript/context/LocationStatusContext';
import { journeyBookingStatus } from '@/readOnly/api/types/JourneyBookingStatus.gen';
// Type representing different modes of transit
export type Transit =
    | 'WALK'
    | 'BUS'
    | 'EXITSTATION'
    | 'METRO'
    | 'SUBWAY'
    | 'AUTO'
    | 'TAXI'
    | 'BIKE'
    | 'WAITING'
    | 'DESTINATION'
    | 'FARAWAY'
    | 'NOTMOVING'
    | 'REFRESHING'
    | 'RELOADING';

// Type representing various states of the journey
export type JourneyState =
    | 'VEHICLEISARRIVING'
    | 'VEHICLEALMOSTARRIVED'
    | 'VEHICLEARRIVED'
    | 'RIDESTARTED'
    | 'RIDECLOSETODESTINATION'
    | 'ARRIVEDATSTATIONPLATFORM'
    | 'RIDEREACHEDDESTINATION'
    | 'VEHICLEWILLBEMISSED'
    | 'VEHICLEBOOKINGPENDING'
    | 'SEARCHINGFORVEHICLE'
    | 'VEHICLEWASMISSED'
    | 'RIDESKIPPED'
    | 'NODRIVERFOUND'
    | 'NOLIVEDATA';

// Interface representing the structure of a transit object
export interface TransitType {
    type: Transit;
    time: number;
    legOrder: string;
    distance: number | null;
    vehicleDetail: string | null;
    place: string;
    exitGate: string | undefined;
    isFirstLeg: boolean;
    isLastLeg: boolean;
    state: JourneyState;
    NextLeg: Transit;
    NoOfStops: number;
    scheduledArrivalTime: string | undefined;
    isJourneyComplete: boolean;
    fromLocation: string | undefined;
    toLocation: string | undefined;
    isShowUpdate: boolean;
    transitMode: TransitMode;
}

export type JourneyStatus = 'LIVE' | 'OFFTRACK' | 'NOTMOVING';

export interface ItineraryCardProps {
    twoTransits: TransitType[];
    entireJourney: Transit[];
    currentStatus: JourneyStatus;
    onPressStatusBadge: () => void;
    onPressDetails: () => void;
    onPressViewTicket: () => void;
    destination: string;
    onPressSwitchToWalk: () => void;
    onPressCallRide: () => void;
    onPressBoostRide: () => void;
    onPressMarkLegComplete: () => Promise<void>;
    onPressViewTimetable: () => void;
    onPressCheckIn: () => void;
    onRetryBooking: (() => Promise<void>) | undefined;
    onMuteJourney: () => void;
    onCompleteJourney: () => Promise<void>;
    onDirectRidePress: () => void;
    onViewJourneyPlan: () => void;
    isLoading: boolean;
    journeyId?: JourneyId;
    currentLegBookingId: string | undefined; // Optional, used for taxi booking
    currentLegMode: TransitMode; // Optional, used for taxi booking
    currentLegOrder: string;
    onPressSafety: () => void;
    currentLegStatus: VehicleState | undefined;
    currentLegBookingStatus: journeyBookingStatus;
    locationStatus?: LocationStatus;
    busFleetNumber: string | undefined;
    busLegData: ProcessedLegInfo | undefined;
}
