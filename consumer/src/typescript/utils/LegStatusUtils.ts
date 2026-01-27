import { type legInfo } from '../../readOnly/api/types/LegInfo.gen';
import { type TrackingStatus_trackingStatus } from '../../readOnly/api/types/Enums.gen';
import { legRouteInfo } from '@/readOnly/api/types/LegRouteInfo.gen';
import { journeyBookingStatus } from '@/readOnly/api/types/JourneyBookingStatus.gen';

// Export VehicleState type
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

/**
 * Checks if a leg's booking is confirmed (active confirmed booking, not completed)
 * Confirmed for Metro/Bus/Subway means the Payment for the leg is done and the ticket is generated.
 * Confirmed for Taxi means the booking is confirmed and the driver is assigned.
 */
export const isBookingConfirmed = (leg: legInfo): boolean => {
    return isBookingStatusConfirmed(leg.bookingStatus);
};

export const isBookingStatusFailed = (leg: legInfo): boolean => {
    return leg.bookingStatus.TAG === 'FRFSBooking' && leg.bookingStatus._0 === 'FAILED';
};

export const isBookingStatusCancelled = (leg: legInfo): boolean => {
    return leg.bookingStatus.TAG === 'FRFSBooking' && ['CANCELLED', 'CANCEL_INITIATED'].includes(leg.bookingStatus._0);
};

export const isBookingStatusConfirmed = (bookingStatus: journeyBookingStatus): boolean => {
    switch (bookingStatus.TAG) {
        case 'Initial':
            return false;
        case 'TaxiBooking':
            return ['CONFIRMED', 'TRIP_ASSIGNED'].includes(bookingStatus._0);
        case 'TaxiRide':
            return !['NEW', 'INPROGRESS'].includes(bookingStatus._0); // TODO :: CANCELLED can be added here ? @Khuzema786
        case 'FRFSBooking':
            return ['CONFIRMING', 'CONFIRMED'].includes(bookingStatus._0);
        case 'FRFSTicket':
        case 'Feedback':
            return true;
        default:
            return false;
    }
};

export const isFRFSBookingAndCancelled = (leg: legInfo): boolean => {
    switch (leg.bookingStatus.TAG) {
        case 'FRFSBooking':
        case 'FRFSTicket':
            return isLegCancelled(leg);
        default:
            return false;
    }
};

/**
 * Determines if a leg can be booked based on its booking status
 * Replaces the deprecated legInfo.skipBooking field logic
 * Note: This is different from journeyConfirmReqElement.skipBooking which is a user choice field
 */
export const canBookLeg = (leg: legInfo): boolean => {
    switch (leg.bookingStatus.TAG) {
        case 'Initial':
            return true;
        case 'TaxiEstimate':
            return ['NEW', 'COMPLETED', 'CANCELLED', 'RIDE_SEARCH_EXPIRED'].includes(leg.bookingStatus._0);
        case 'TaxiBooking':
        case 'FRFSBooking':
        case 'TaxiRide':
        case 'FRFSTicket':
            return !isBookingConfirmed(leg);
        default:
            return false;
    }
};

/**
 * Gets tracking status for a leg, considering sub-leg order for Metro/Subway
 */
export const getTrackingStatusForLeg = (
    leg: legInfo,
    subLegOrder: number | undefined,
): TrackingStatus_trackingStatus => {
    // For Metro/Subway legs, check sub-leg order
    if ((leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway') && subLegOrder !== undefined) {
        const routeInfo = leg.legExtraInfo._0.routeInfo?.find((route: legRouteInfo) => route.subOrder === subLegOrder);
        if (routeInfo?.trackingStatus) {
            return routeInfo.trackingStatus;
        }
    } else if ((leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway') && subLegOrder === undefined) {
        const routeInfo = leg.legExtraInfo._0.routeInfo?.[leg.legExtraInfo._0.routeInfo.length - 1];
        if (routeInfo?.trackingStatus) {
            return routeInfo.trackingStatus;
        }
    } else if (
        (leg.legExtraInfo.TAG === 'Walk' || leg.legExtraInfo.TAG === 'Taxi' || leg.legExtraInfo.TAG === 'Bus') &&
        leg.legExtraInfo._0.trackingStatus
    ) {
        return leg.legExtraInfo._0.trackingStatus;
    }
    return 'InPlan';
};

/**
 * Checks if a leg is currently ongoing
 */
export const isLegOngoing = (leg: legInfo): boolean => {
    // PRIORITY 1: Check tracking status first
    const trackingStatus = getTrackingStatusForLeg(leg, undefined);
    if (trackingStatus === 'Ongoing' || trackingStatus === 'Finishing' || trackingStatus === 'ExitingStation') {
        return true;
    }

    // PRIORITY 2: Any TaxiRide is considered ongoing
    if (leg.bookingStatus.TAG === 'TaxiRide') {
        return !['COMPLETED', 'CANCELLED'].includes(leg.bookingStatus._0);
    }

    return false;
};

/**
 * Checks if a leg is completed
 */
export const isLegCompleted = (leg: legInfo): boolean => {
    // PRIORITY 1: Check tracking status first
    const trackingStatus = getTrackingStatusForLeg(leg, undefined);
    if (trackingStatus === 'Finished') {
        return true;
    }

    // PRIORITY 2: Check booking status for completed rides/tickets
    return isBookingStatusCompleted(leg.bookingStatus);
};

export const isBookingStatusCompleted = (bookingStatus: journeyBookingStatus): boolean => {
    switch (bookingStatus.TAG) {
        case 'Initial':
            return false;
        case 'TaxiBooking':
        case 'TaxiRide':
            return bookingStatus._0 === 'COMPLETED';
        case 'FRFSTicket':
            return bookingStatus._0 === 'USED';
        case 'Feedback':
            return bookingStatus._0 === 'FEEDBACK_PENDING';
        default:
            return false;
    }
};

/**
 * Checks if a leg is cancelled
 */
export const isLegCancelled = (leg: legInfo): boolean => {
    switch (leg.bookingStatus.TAG) {
        case 'Initial':
            return false;
        case 'TaxiEstimate':
        case 'TaxiBooking':
        case 'TaxiRide':
            return leg.bookingStatus._0 === 'CANCELLED';
        case 'FRFSBooking':
        case 'FRFSTicket':
            return ['CANCELLED', 'COUNTER_CANCELLED'].includes(leg.bookingStatus._0);
        default:
            return false;
    }
};

/**
 * Checks if a leg failed
 */
export const isLegFailed = (leg: legInfo): boolean => {
    switch (leg.bookingStatus.TAG) {
        case 'Initial':
            return false;
        case 'TaxiEstimate':
            return leg.bookingStatus._0 === 'CANCELLED'; // No FAILED status for estimates
        case 'TaxiBooking':
        case 'TaxiRide':
            return false; // No FAILED status for taxi booking/ride
        case 'FRFSBooking':
            return leg.bookingStatus._0 === 'FAILED';
        case 'FRFSTicket':
            return false; // No FAILED status for tickets
        default:
            return false;
    }
};

/**
 * Determines if a leg should be included in price calculation
 */
export const shouldIncludeInPriceCalculation = (leg: legInfo): boolean => {
    return isBookingConfirmed(leg) || isLegOngoing(leg) || isBookingStatusFailed(leg) || isBookingStatusCancelled(leg); // Include all ongoing, completed and failed rides
};

/**
 * Determines if a leg can be cancelled
 */
export const canCancelLeg = (leg: legInfo): boolean => {
    // Can't cancel if already completed, cancelled, or failed
    if (isLegCompleted(leg) || isLegCancelled(leg) || isLegFailed(leg)) {
        return false;
    }

    // Can't cancel if journey is already ongoing
    if (isLegOngoing(leg)) {
        return false;
    }

    // Can cancel if booking is confirmed but journey hasn't started
    return isBookingConfirmed(leg);
};

/**
 * Maps TrackingStatus and BookingStatus to VehicleState
 * Both tracking and booking status can exist - tracking status takes priority for active journeys
 */
export const mapLegToVehicleState = (leg: legInfo, subLegOrder: number | undefined): VehicleState => {
    // Handle cancelled/failed states first
    const trackingStatus = getTrackingStatusForLeg(leg, subLegOrder);

    // PRIORITY 1: If tracking status exists, use it (means journey is active)
    if (trackingStatus) {
        switch (trackingStatus) {
            case 'InPlan':
                // Even with InPlan tracking, check booking status for more specific state
                switch (leg.bookingStatus.TAG) {
                    case 'Initial':
                        return 'VEHICLEBOOKINGPENDING';
                    case 'TaxiEstimate':
                        switch (leg.bookingStatus._0) {
                            case 'NEW':
                                return 'VEHICLEBOOKINGPENDING';
                            case 'RIDE_SEARCH_EXPIRED':
                                return 'NODRIVERFOUND';
                            case 'DRIVER_QUOTE_REQUESTED':
                                return 'SEARCHINGFORVEHICLE';
                            case 'GOT_DRIVER_QUOTE':
                                return 'SEARCHINGFORVEHICLE';
                            case 'DRIVER_QUOTE_CANCELLED':
                                return 'RIDESKIPPED';
                            case 'CANCELLED':
                                return 'RIDESKIPPED';
                            case 'COMPLETED':
                                return 'VEHICLEBOOKINGPENDING';
                            default:
                                return 'SEARCHINGFORVEHICLE';
                        }
                    case 'TaxiBooking':
                        return isBookingConfirmed(leg) ? 'VEHICLEISARRIVING' : 'VEHICLEBOOKINGPENDING';
                    case 'TaxiRide':
                        return 'VEHICLEISARRIVING';
                    case 'FRFSBooking':
                        return isBookingConfirmed(leg) ? 'VEHICLEISARRIVING' : 'VEHICLEBOOKINGPENDING';
                    case 'FRFSTicket':
                        return 'VEHICLEISARRIVING';
                    default:
                        break;
                }
                // Default for InPlan with tracking
                if (['Metro', 'Subway', 'Bus'].includes(leg.travelMode ?? '')) {
                    return 'VEHICLEISARRIVING';
                }
                return 'VEHICLEBOOKINGPENDING';
            case 'Arriving':
                return 'VEHICLEISARRIVING';
            case 'AlmostArrived':
                return 'VEHICLEALMOSTARRIVED';
            case 'Arrived':
                return 'VEHICLEARRIVED';
            case 'Ongoing': {
                if (['Metro', 'Subway', 'Bus', 'Walk'].includes(leg.travelMode ?? '')) {
                    return 'RIDESTARTED';
                }
                return getVehicleStateFromBookingStatus(leg);
            }
            case 'Finishing':
                return 'RIDECLOSETODESTINATION';
            case 'ExitingStation':
                return 'ARRIVEDATSTATIONPLATFORM';
            case 'Finished':
                return 'RIDEREACHEDDESTINATION';
            default:
                return getVehicleStateFromBookingStatus(leg);
        }
    } else {
        return getVehicleStateFromBookingStatus(leg);
    }
};

const getVehicleStateFromBookingStatus = (leg: legInfo): VehicleState => {
    switch (leg.bookingStatus.TAG) {
        case 'Initial':
            return 'VEHICLEBOOKINGPENDING';
        case 'TaxiEstimate':
            switch (leg.bookingStatus._0) {
                case 'NEW':
                    return 'VEHICLEBOOKINGPENDING';
                case 'RIDE_SEARCH_EXPIRED':
                    return 'NODRIVERFOUND';
                case 'CANCELLED':
                    return 'RIDESKIPPED';
                case 'COMPLETED':
                    return 'VEHICLEBOOKINGPENDING';
                default:
                    return 'SEARCHINGFORVEHICLE';
            }
        case 'TaxiBooking':
            switch (leg.bookingStatus._0) {
                case 'NEW':
                    return 'VEHICLEBOOKINGPENDING';
                case 'CONFIRMED':
                    return 'VEHICLEISARRIVING';
                case 'TRIP_ASSIGNED':
                    return 'VEHICLEISARRIVING';
                case 'COMPLETED':
                    return 'RIDEREACHEDDESTINATION';
                case 'CANCELLED':
                case 'REALLOCATED':
                    return 'RIDESKIPPED';
                default:
                    return 'VEHICLEBOOKINGPENDING';
            }
        case 'TaxiRide':
            switch (leg.bookingStatus._0) {
                case 'NEW':
                case 'UPCOMING':
                    return 'VEHICLEISARRIVING';
                case 'INPROGRESS':
                    return 'RIDESTARTED';
                case 'COMPLETED':
                    return 'RIDEREACHEDDESTINATION';
                case 'CANCELLED':
                    return 'RIDESKIPPED';
                default:
                    return 'VEHICLEISARRIVING';
            }
        case 'FRFSBooking':
            switch (leg.bookingStatus._0) {
                case 'NEW':
                case 'PAYMENT_PENDING':
                case 'CONFIRMING':
                    return 'VEHICLEBOOKINGPENDING';
                case 'CONFIRMED':
                    return 'VEHICLEISARRIVING';
                case 'CANCELLED':
                case 'COUNTER_CANCELLED':
                case 'FAILED':
                    return 'RIDESKIPPED';
                default:
                    return 'VEHICLEBOOKINGPENDING';
            }
        case 'FRFSTicket':
            switch (leg.bookingStatus._0) {
                case 'ACTIVE':
                    return 'VEHICLEISARRIVING';
                case 'INPROGRESS':
                    return 'RIDESTARTED';
                case 'USED':
                    return 'RIDEREACHEDDESTINATION';
                case 'CANCELLED':
                case 'COUNTER_CANCELLED':
                case 'EXPIRED':
                    return 'RIDESKIPPED';
                default:
                    return 'VEHICLEISARRIVING';
            }
        case 'Feedback':
            return 'RIDEREACHEDDESTINATION';
        default:
            return 'SEARCHINGFORVEHICLE';
    }
};
