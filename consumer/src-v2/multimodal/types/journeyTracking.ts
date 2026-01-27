import { type latLong as LatLongType } from '../../../src/readOnly/api/types/LatLong.gen';
import { type MultimodalTravelMode_multimodalTravelMode as Enums_MultimodalTravelMode_multimodalTravelMode } from '../../../src/readOnly/api/types/Enums.gen';
import { type transportStation } from '../../../src/readOnly/api/types/PublicTransportData.gen';
import { type Transit } from '../screens/NewLiveJourney/components/Iternary/types';
import { TimeEntry } from '../screens/NewLiveJourney/screens/TransitTracking/TransitTimetable';
import { type priceAPIEntity } from '@/readOnly/api/types/PriceAPIEntity.gen';
import { type geoJsonGeometry } from '@/api/apiTypes/ServiceabilityApi.gen';
import { LocationWithTimestamp } from '../hooks/useRiderLocation';
import { type journeyBookingStatus } from '@/readOnly/api/types/JourneyBookingStatus.gen';
import { type TrackingStatus_trackingStatus } from '@/readOnly/api/types/Enums.gen';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

export type { LatLongType as latLong, TimeEntry };

export type RiderLocationState = LatLongType;

export type VehicleState =
    | 'SEARCHINGFORVEHICLE'
    | 'VEHICLEISARRIVING'
    | 'VEHICLEALMOSTARRIVED'
    | 'VEHICLEARRIVED'
    | 'RIDESTARTED'
    | 'RIDECLOSETODESTINATION'
    | 'RIDEREACHEDDESTINATION'
    | 'ARRIVEDATSTATIONPLATFORM'
    | 'VEHICLEWASMISSED'
    | 'VEHICLEBOOKINGPENDING'
    | 'VEHICLEWILLBEMISSED'
    | 'RIDESKIPPED'
    | 'NODRIVERFOUND'
    | 'NOLIVEDATA';

export type LatLongStopInfo = LatLongType & {
    stopInfo: Stop | undefined;
    timeFromStart: number | undefined;
};

export type UserState = 'WALK' | 'WAITING' | 'INVEHICLE' | 'FARAWAY' | 'NONE' | 'EXITSTATION';

export type TransitMode = 'WALK' | 'BUS' | 'METRO' | 'SUBWAY' | 'TAXI' | 'AUTO' | 'BIKE';

export interface TrackedLegInfoStaticInfo {
    timetable: TimeEntry[] | undefined;
    duration: number | undefined;
    distance: number | undefined;
    legOrder: string;
    travelMode: Enums_MultimodalTravelMode_multimodalTravelMode;
    stops: StopType;
    onRouteStops: StopType;
    routeWaypoints: LatLongType[];
    filteredRouteWaypoints: LatLongStopInfo[];
    origin: {
        stopCode: string | undefined;
        entryGate: string | undefined;
        exitGate: string | undefined;
        stationName: string | undefined;
        latLong: LatLongType;
        geoJson: geoJsonGeometry | undefined;
        regionalName: string | undefined;
    };
    destination: {
        stopCode: string | undefined;
        entryGate: string | undefined;
        exitGate: string | undefined;
        stationName: string | undefined;
        latLong: LatLongType;
        geoJson: geoJsonGeometry | undefined;
        regionalName: string | undefined;
    };
    preDestination: {
        stopCode: string | undefined;
        name: string | undefined;
    };
    towardsStation: string | undefined;
    vehicleName: string | null;
    tickets: string[] | undefined;
    ticketCreatedAt: string[] | undefined;
    categories: categoryInfoResponse[];
    alternateRoutesNames: string[] | undefined;
    platform: string | undefined;
    startTime?: string;
    bookingId?: string;
    searchId: string;
    selectedQuoteId?: string;
    selectedServiceTierName?: string;
    busConductorId: string | undefined;
    busDriverId: string | undefined;
    driverNumber: string | undefined;
    exoNumber: string | undefined;
    otp: string | undefined;
    fare: priceAPIEntity | undefined;
    vehicleIconUrl: string | undefined;
    isLoading: boolean;
    lineColor: string[] | undefined;
    bookingStatus: journeyBookingStatus | undefined;
    ticketNumber: string | undefined;
    allSourceStations: string[] | undefined;
    allDestinationStations: string[] | undefined;
    allTowardsStations: string[] | undefined;
    allLineColors: string[] | undefined;
}

export interface StopsInformationItem {
    sequenceNumber: number;
    stopCode: string | undefined;
    eta: number;
}

export interface LiveVehicleData {
    id: string;
    loc: LatLongType | undefined;
    stopsInformation: StopsInformationItem[];
}

export interface ConfirmedBoardingData {
    confimationTimestamp: number;
    lastCrossedStopCode: string | undefined;
    detectedWithSuperReliableLocation: boolean;
}
export interface TrackedLegInfoRealTimeInfo {
    frequency: number | undefined;
    liveVehicleData: LiveVehicleData[];
    currentLiveVehicle: LiveVehicleData | undefined;
    originStopETAInMinutes: number | undefined;
    destinationStopETAInMinutes: number | undefined;
    currentStop: Stop | undefined;
    remainingStops: number | undefined;
    upcomingVehicleArrivals: number[];
    possibleCheckInStations: StopType;
    confirmedBoardingData: ConfirmedBoardingData | undefined;
    busFleetNumber: string | undefined;
}

export type GatesInfo = {
    gateName: string;
    stop_code: string;
    lat: number;
    lon: number;
};

export type Stop = Partial<transportStation> & {
    parsedGeoJson: geoJsonGeometry | undefined;
    parsedGatesInfo: GatesInfo[] | undefined;
    stopCode: string;
    sequenceNum: number;
    distance: number;
    timeFromPrev: number;
};

export type StopType = Array<Stop>;
export interface ProcessedLegInfo {
    currentLeg: string;
    userState: UserState;
    vehicleState: VehicleState;
    transitMode: TransitMode;
    insideSpecialZone: boolean;
    staticInfo: TrackedLegInfoStaticInfo;
    realTimeInfo: TrackedLegInfoRealTimeInfo;
    riderLocation: LocationWithTimestamp;
    riderLocationHistory: LocationWithTimestamp[];
    displayTransitType: Transit;
    vehicleIdentifier: string | null;
    durationInMinutes: number;
    distanceValue: number | null;
    isFirstLeg: boolean;
    isLastLeg: boolean;
    platformInfo?: string | undefined;
    taxiBookingId?: string;
    hasApplicablePasses?: boolean | undefined;
    splitUpOrientation: 'horizontal' | 'vertical';
    fare?: number;
    vehicleIconUrl?: string | undefined;
    isPotentialCurrentLeg: boolean;
    confirmationCount: number;
    bookingStatus: journeyBookingStatus;
    trackingStatus: TrackingStatus_trackingStatus;
    previousTravelMode?: Enums_MultimodalTravelMode_multimodalTravelMode | undefined;
    previousTravelModeStatusConfirmed: boolean | undefined;
    farawayTarget: 'origin' | 'destination' | undefined;
}
