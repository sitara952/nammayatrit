import { TransitSummaryType } from '../JourneyInfoScreen/components/TransitSummaryChennaiOne';
import { TransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';

export type PublicMode = 'train' | 'bus' | 'metro';
export type PrivateMode = 'taxi' | 'auto' | 'bike';
export type AllModes = PublicMode | PrivateMode;

export interface BaseLeg {
    mode: TransitType;
    destination: string;
    duration: string; // e.g. "8 min"
}

export interface WalkLeg extends BaseLeg {
    mode: 'walk';
    distance: string; // e.g. "200m"
    legInfo: string;
}

export interface TransitLeg extends BaseLeg {
    mode: 'bus' | 'metro' | 'train';
    source: string;
    routeNumber: string | undefined; // e.g. "527A" for bus
    lineColor: string | undefined; // e.g. "Blueline" for metro
    legInfo: string;
}

export interface AutoLeg extends BaseLeg {
    mode: 'auto' | 'taxi';
    source: string;
    legInfo: string;
}

export type JourneyLeg = WalkLeg | TransitLeg | AutoLeg;

export interface Journey {
    legs: JourneyLeg[];
    totalDuration: string;
    totalDistance: string | undefined;
}

// StarRating component props
export interface StarRatingProps {
    rating: number;
    onRatingChange: ((rating: number) => void) | undefined;
}

export interface RatingStarProps {
    item: number;
    rating: number;
    onPressStar: (rating: number) => void;
    index: number;
}

// ScreenHeader component props
export interface ScreenHeaderProps {
    onGoBack: (() => void) | undefined;
    onShowTicket: (() => void) | undefined;
}

export interface JourneyReviewCardProps {
    destination: string;
    costSaved: number | undefined;
    timeSaved: number | undefined;
    totalJourneyCost: number;
    journeyLegs: TransitSummaryType[];
    journeyTime: string;
    initialRating: number | undefined;
    publicTransportCost: number;
    autoCost: number;
    tollCharges: number;
    surgeCharges: number;
    onSubmitFeedback: ((rating: number, feedback: string) => void) | undefined;
    onSkipToHome: (() => void) | undefined;
}

// JourneyHighlightCard component props
export interface JourneyHighlightCardProps {
    mode: PublicMode | undefined;
    timeSaved: number;
    costSaved: number;
    journeyModes: AllModes[];
}

// ShareWithFriendsButton component props
export interface ShareWithFriendsButtonProps {
    onShareWithFriends: (() => void) | undefined;
}

// FallbackHighlightCard component props
export interface FallbackHighlightCardProps {
    mode: PublicMode | undefined;
    timeSaved: number;
    costSaved: number;
    journeyModes: AllModes[];
}

// StaticJourneyHighlightCard component props
export interface StaticJourneyHighlightCardProps {
    mode: PublicMode | undefined;
    timeSaved: number;
    costSaved: number;
    journeyModes: AllModes[];
    isFallback: boolean;
}

// Root JourneyComplete screen props
export interface JourneyCompleteProps {
    // Journey highlight data
    primaryMode: PublicMode | undefined;
    timeSaved: number;
    costSaved: number;
    journeyModes: AllModes[];

    // Journey review data
    destination: string;
    totalJourneyCost: number;
    journeyLegs: TransitSummaryType[];
    journeyTime: string;
    publicTransportCost: number;
    autoCost: number;
    tollCharges: number;
    surgeCharges: number;
    // Rating data
    initialRating: number | undefined;

    // Callbacks - all explicitly defined, no optional chaining
    onGoBack: (() => void) | undefined;
    onShowTicket: (() => void) | undefined;
    // onShareWithFriends: (() => void) | undefined;
    onSubmitFeedback: ((rating: number, feedback: string) => void) | undefined;
}
