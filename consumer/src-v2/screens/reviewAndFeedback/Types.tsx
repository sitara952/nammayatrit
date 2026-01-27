import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { disability } from '@/readOnly/api/types/Disability.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { FeatureFlags } from '@/src-v2/systems/configs/types';
import { RideId } from '@/typescript/state/client/booking';
import { RatingScreenType } from '@/typescript/state/client/ride';
import { BookingId } from '@/typescript/state/client/user';
import { Action, Resolver } from '@/typescript/utils/common';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { ImageSourcePropType, LayoutChangeEvent } from 'react-native';
import { MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';

export type ReviewAndFeedbackScreenAction =
    | Action<'REVIEW_AND_FEED_BACK_API_CALL'>
    | Action<'ON_PRESS_RIDE_DETAILS'>
    | Action<'GO_TO_JOURNEY_OVERVIEW'>
    | Action<'HANDLE_RIDE_CHECK_POP_UP', { type: RideChecksType }>
    | Action<'RATE_RIDE', { rating: number }>
    | Action<'HANDLE_ON_LAYOUT', { event: LayoutChangeEvent }>
    | Action<'HANDLE_SOS_PRESS'>
    | Action<'HANDLE_HARDWARE_BACK_PRESS'>;

export type ReviewAndFeedbackProps = {
    bookingId: BookingId | null;
    rating: number;
    rideId: RideId | null;
    showLogo: boolean;
    navigateToHome: (val: boolean) => void;
    featureFlags: FeatureFlags;
    absFareDifference: number;
    rideDetails: rideAPIEntity | null;
    distanceFareDiff: number | undefined;
    waitingCharges: number | undefined;
    specialAssistance: disability | undefined | null;
    bookingDetails: bookingAPIEntity | null;
    extraTimeFare: number | undefined;
    fareDifference: number;
    extraTime: number;
    appName: string;
    extraDistanceFare: number | undefined;
    rcsDispatch: Resolver<ReviewAndFeedbackScreenAction>;
    reviewAndFeedbackApiCall: () => void;
    ratingScreen: RatingScreenType;
    transportAvatarUri: ImageSourcePropType;
    estimatedPriceWidth: number;
    rideCompleteBgUri: string;
    initiallyFavorite: boolean;
    setinitiallyFavorite: (val: boolean) => void;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
};

export type FinalFareViewProps = {
    fareDifference: number;
    estimatedTotalFare: number | undefined;
    computedPrice: number | undefined;
    currency: string;
    isRideCompletedSectionFlexRow: boolean | undefined;
    specialAssistance: disability | undefined | null;
    rcsDispatch: Resolver<ReviewAndFeedbackScreenAction>;
    estimatedPriceWidth: number;
};

export type SosOrCallPoliceButtonProps = {
    bookingId: BookingId | null;
    rcsDispatch: Resolver<ReviewAndFeedbackScreenAction>;
};
