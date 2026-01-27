import { Action, Resolver } from '@/typescript/utils/common';
import { TransitType } from '../../components/PublicTransportCard/types';
import { legInfo as LegInfo_legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { JourneyId } from '@/typescript/state/client/user';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { MyBookingDetailsScreenAction } from '@/src-v2/screens/MyBookingDetails/Types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
// import { MultimodalTravelMode_multimodalTravelMode as TransitType } from '@/readOnly/api/types/Enums.gen';

export type MultiModalRideEndAction =
    | Action<'SKIP_TO_HOME'>
    | Action<'SUBMIT_FEEDBACK', { goToHomeScreen: boolean }>
    | Action<'NEED_HELP'>
    | Action<'GET_FULL_JOURNEY_SUMMARY'>
    | Action<'JOURNEY_AUTO_DETAIL_CLICKED', { bookingId: string }>
    | Action<'TOGGLE_RATING_STARS', { index: number }>
    | Action<'RATE_TRAVEL_MODE', { legOrder: number; isGoodExperience: boolean }>
    | Action<'ADDITIONAL_FEEDBACK', { feedBackString: string }>
    | Action<'ACCORDION_TOGGLE', { state: boolean }>
    | Action<'INPUT_IS_FOCUSED', { state: boolean }>;

export type MultiTransitFeedbackScreenProps = {
    fullJourneyActionDispatch: () => {};
    estimatedAmount: number | undefined;
    finalAmount: number | undefined;
    savedAmount: number | undefined;
    journeySummary: JourneySummary[] | undefined;
    transcitLegRating: TranscitLegRatingProp[] | undefined;
    legs: LegInfo_legInfo[];
    journeyId: JourneyId | null;
    mpDispatch: Resolver<MultiModalRideEndAction>;
    isSingleTransit: boolean;
    uniqueMode: TransitType | undefined;
};

export type MultiTransitBottomScreenProps = {
    transcitLegRating: TranscitLegRatingProp[] | undefined;
    fromJourney: boolean;
    legs: LegInfo_legInfo[];
    journeyId: JourneyId | null;
    bookingDetailsFeedbackRef: React.RefObject<BottomSheetModalMethods | null> | null;
    initialRating: number;
    onRatingSubmitted: (rating: number) => void;
};

export type SubAutoJourneysRatingProps = {
    mbdDispatch: Resolver<MyBookingDetailsScreenAction>;
    legOrder: number;
    journeyId: JourneyId | null;
};

export type TranscitLegRatingProp = {
    transitMode: TransitType;
    legOrder: number;
    count: number | undefined;
};

export type RatingsCardTypes = {
    rating: number;
    mpDispatch: Resolver<MultiModalRideEndAction>;
};

export type RatingStarProps = {
    item: number;
    rating: number;
    mpDispatch: Resolver<MultiModalRideEndAction>;
    index: number;
};

export type AccordionProps = {
    accordionState: boolean;
    mpDispatch: Resolver<MultiModalRideEndAction>;
    bottomSheetModalRef: React.RefObject<BottomSheetModal | null> | null;
    journeyItems: TranscitLegRatingProp[];
    travelModeRate: Record<number, boolean>;
    editable: boolean;
};

export type JourneyItem = {
    destination: string;
    totalCost: number;
    transitMode: string;
};

export type JourneySummary = {
    destination: string;
    totalCost: number;
    transitMode: TransitType;
    legOrder: number;
};

export type TransitSplitSectionProps = {
    handleOnPressFullDetails: () => void;
    journeySummary: JourneySummary[];
    singleTransit: boolean;
};

export type RateTravelModeProps = {
    item: TranscitLegRatingProp;
    mpDispatch: Resolver<MultiModalRideEndAction>;
    travelModeRate: Record<number, boolean>;
    editable: boolean;
};

export type YesOrNoProps = {
    travelModeRate: Record<number, boolean>;
    mpDispatch: Resolver<MultiModalRideEndAction>;
    legOrder: number;
    editable: boolean;
};
