// Main screen component
export { JourneyCompleteUI } from './UI';
export { JourneyCompleteFlow } from './Flow';

// Individual components
export { JourneyHighlightCard } from './components/JourneyHighlightCard';
export { FallbackHighlightCard } from './components/FallbackHighlightCard';
export { ScreenHeader } from './components/ScreenHeader';
export { ShareWithFriendsButton } from './components/ShareWithFriendsButton';
export { JourneyReviewCard } from './components/JourneyReviewCard';
export { StarRating } from './components/StarRating';

// Utility components
export { FullScreenRadialGradient } from './UI';

// Types
export type {
    JourneyCompleteProps,
    JourneyHighlightCardProps,
    FallbackHighlightCardProps,
    StaticJourneyHighlightCardProps,
    ScreenHeaderProps,
    ShareWithFriendsButtonProps,
    JourneyReviewCardProps,
    StarRatingProps,
    RatingStarProps,
    PublicMode,
    PrivateMode,
    AllModes,
    JourneyLeg,
    BaseLeg,
    WalkLeg,
    TransitLeg,
    AutoLeg,
    Journey,
} from './types';
