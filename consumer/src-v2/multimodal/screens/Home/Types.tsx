import { strings } from 'config-types';
import { HomeScreenServices } from '../SingleModeSearch/Types';
import { FavProps } from '@/src-v2/components/FavouritesComponent/types';
import { BottomSheetStage } from '@/typescript/state/client/session';
export type PlanJourneyAction = {
    type: 'PLAN_JOURNEY';
};

export type ViewAllPlacesAction = {
    type: 'VIEW_ALL_PLACES';
    payload: { category: 'recent' | 'popular' };
};

export type RecenterMapAction = {
    type: 'RECENTER_MAP';
};

export type GoToSingleModeBooking = {
    type: 'GO_TO_SINGLE_MODE_BOOKING';
    payload: { bookingType: HomeScreenServices };
};

export type GoToOtpBusFlow = {
    type: 'GO_TO_OTP_BUS';
};

export type HomeScreenAction =
    | PlanJourneyAction
    | ViewAllPlacesAction
    | RecenterMapAction
    | GoToSingleModeBooking
    | GoToOtpBusFlow;

export type HomeScreenProps = {
    mpDispatch: (action: HomeScreenAction, userLanguageStrings: strings) => void;
    isCurrentLocationServiceable: boolean | undefined;
    favoritesOnClick: (locationDetails: FavProps) => void;
    isVisible: boolean;
    onHeightChange: (height: number) => void | undefined;
    bottomSheetStage: BottomSheetStage;
    isLiveBusTracking: boolean;
};
