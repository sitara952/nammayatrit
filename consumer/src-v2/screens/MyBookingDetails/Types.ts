import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen.tsx';
import { BookingDetailCardProps } from '../MyRides/UI';
import { BookingRideDetailsProps } from './components/BookingRideDetails.tsx';
import { Action, Resolver } from '@/typescript/utils/common.ts';
import { tripCategory } from '@/readOnly/api/types/TripCategory.gen.tsx';
import { stopInformation } from '@/readOnly/api/types/StopInformation.gen.tsx';
import { RatingScreenType } from '@/typescript/state/client/ride.ts';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen.tsx';
import { JourneyId } from '@/typescript/state/client/user.ts';
import { TranscitLegRatingProp } from '@/src-v2/multimodal/screens/MultiTransitFeedback/types.ts';
import { journeyFeedBackForm } from '@/readOnly/api/types/JourneyFeedBackForm.gen.tsx';
import { rateMultiModelTravelModes } from '@/readOnly/api/types/RateMultiModelTravelModes.gen.tsx';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen.tsx';
import { issueCategoryListRes } from '@/readOnly/api/types/IssueCategoryListRes.gen.tsx';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen.tsx';

export type BookingDetailsUIProps = {
    fromLocation: locationAPIEntity;
    stops: locationAPIEntity[];
    rideStartTime: string | undefined;
    rideEndTime: string | undefined;
    stopsInfo: stopInformation[] | undefined;
    rideDetail: BookingDetailCardProps;
    bookingDetailMiddle: BookingRideDetailsProps;
    showEstimate: boolean;
    showRideDetails: boolean;
    showHelpAndSupport: boolean;
    tripCategory: tripCategory | undefined;
    isCancelled: boolean;
    mbdDispatch: Resolver<MyBookingDetailsScreenAction>;
    top: number;
    ratingScreen: RatingScreenType;
    rateRide: (newRating: number) => void;
    onSubmit: (rating: number) => void;
    snapPoints: number[] | undefined;
    bookingDetailsFeedbackRef: React.RefObject<BottomSheetModalMethods | null>;
    rating: number;
    reviewAndFeedbackApiCall: () => Promise<void>;
    initiallyFavorite: boolean;
    setinitiallyFavorite: (initiallyFavorite: boolean) => void;
    isInsured: boolean;
    refreshData: (() => void) | undefined;
    autoClickAction: (bookingId: string | undefined, legOrder: number | undefined) => void;
    transcitLegRating: TranscitLegRatingProp[] | undefined;
    journey: JourneyDetail | null;
    isMultimodal: boolean;
    rideDistance: string;
    rideTime: string;
    currentRating: number;
    onRatingChange: (rating: number) => void;
    showTrainDetailsInMyRides: boolean;
    issueCategory: issueCategoryListRes | undefined;
};

export type JourneyDetail = {
    journeyDetails: JourneyDetails | null;
    subAutoLegDetails: SubAutoLegDetails | null;
    journeyId: JourneyId | null;
};

export type SubAutoLegDetails = {
    subAutoLegOrder: number | null;
};

export type JourneyDetails = {
    isJourney: boolean;
    journeyModes: legInfo[];
    journeyId: JourneyId | null;
    journeyFeedBack: journeyFeedBackForm | null;
};

export type JourneyDetailCardProps = {
    fromLocation: locationAPIEntity;
    stops: locationAPIEntity[];
    rideStartTime: string | undefined;
    rideEndTime: string | undefined;
    createdAt: string;
    showRideDetails: boolean;
    tripCategory: tripCategory | undefined;
    rideDetails: BookingDetailCardProps;
    bookingDetailMiddle: BookingRideDetailsProps;
    journeyDetails: JourneyDetails | null;
    autoClickAction: (bookingId: string | undefined, legOrder: number | undefined) => void;
    transcitLegRating: TranscitLegRatingProp[] | undefined;
};

export type SubAutoDetails = {
    legOrder: number;
};

export type RideDetailCardProps = {
    bookingDetailCard: BookingDetailCardProps | null;
    journeyDetailCard: JourneyDetailCardProps | null;
    showEstimate: boolean;
    showHelpAndSupport: boolean | undefined;
    isCancelled: boolean;
    subAutoDetails: SubAutoDetails | null;
    issueCategory: issueCategoryListRes | undefined;
};

export type BusData = {
    mode: 'Bus';
    header: string;
    fare: string;
    source: string;
    destination: string;
    categories: categoryInfoResponse[] | undefined;
};

export type MetroData = {
    mode: 'Metro';
    header: string;
    fare: string;
    source: string;
    destination: string;
    categories: categoryInfoResponse[] | undefined;
};

export type TrainData = {
    fare: string;
    sourceName: string;
    destinationName: string;
    via: string;
    trainTypeCode: string;
    serviceTier: string;
    categories: categoryInfoResponse[] | undefined;
};

export type MyBookingDetailsScreenAction =
    | Action<'GO_BACK'>
    | Action<'COPY_TO_CLIPBOARD'>
    | Action<'GO_TO_HELP_AND_SUPPORT', { issueCategory: issueCategoryRes }>
    | Action<'GO_TO_DRIVER_INVOICE'>
    | Action<'ADD_FEEDBACK', { openJourneyFeedBack: boolean }>
    | Action<'ALTERNATE_NAVIGATE_TO_HOME'>
    | Action<'ON_SUBMIT'>
    | Action<'DOWNLOAD_INSURANCE_POLICY'>
    | Action<'ADD_SUBAUTO_FEEDBACK', { subAutoFeedBack: rateMultiModelTravelModes; journeyId: JourneyId | null }>;

export type MyJourneyDetailsScreenAction = Action<'NO_ACTION'>;
