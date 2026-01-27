import {
    type ProcessedLegInfo,
    type UserState,
    type VehicleState,
    type TransitMode,
} from '@/src-v2/multimodal/types/journeyTracking';
import { type LiveJourneyDetailViewData } from '@/src-v2/multimodal/screens/LiveJourneyDetail/Types';
import { type ItineraryCardProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types';
import { CallDriverProps } from '../screens/LiveJourneyOverview/UI';
import { HandlerContext } from './JourneyActionHandlers';
import { LiveJourneyPopupType, LiveJourneyPopupModalProps } from '../screens/LiveJourneyDetail/LiveJourneyPopupManager';

export type ScreenType = 'LiveJourneyDetail' | 'LiveJourneyOverview';

export type RuleHandlerParams = {
    currentLeg: ProcessedLegInfo;
    allLegs: ProcessedLegInfo[];
    handlerContext: HandlerContext;
    // Callbacks - make them all optional at this generic level,
    // specific handlers will know if they need them for a given screenType
    onPressTicket: (() => void) | undefined;
    onPressTrackMode: (() => void) | undefined;
};

export interface PopupRuleOutput {
    id: string; // A unique identifier for the popup instance
    type: LiveJourneyPopupType;
    props: LiveJourneyPopupModalProps;
}

export type DetailScreenRuleOutput = Partial<
    Omit<
        LiveJourneyDetailViewData,
        | 'showDetailedTransitTracking'
        | 'showTimetable'
        | 'onShowDetailedTransitTracking'
        | 'onHideDetailedTransitTracking'
        | 'detailedTransitTrackingComponentProps'
        | 'detailedTimetableProps'
        // transitMode, userState, vehicleState are added back by the main hook
        // detailedLiveHeaderProps can be top-level or nested, so we don't omit it here.
        // The main hook will assemble the final LiveJourneyDetailViewData.
        // We only omit props that are *exclusively* managed by the main hook and not by rules.
        | 'transitMode'
        | 'userState'
        | 'vehicleState'
        // Keep detailedLiveHeaderProps as potentially top-level if not nested by a rule
    >
>;
// This means DetailScreenRuleOutput can include 'detailedLiveHeaderProps' at the top level.
// Individual rules will decide if they provide it top-level or nested.
// The main useLiveJourneyDetailFlow hook will still be responsible for the final assembly.

// Output type for LiveJourneyOverview screen rules
export type OverviewScreenRuleOutput =
    | (ItineraryCardProps & {
          callDriverProps: CallDriverProps | null;
      })
    | null;

export type JourneyRuleReturn = DetailScreenRuleOutput | OverviewScreenRuleOutput | PopupRuleOutput;

export type JourneyRule = {
    name: string; // For debugging
    screenType: ScreenType | ScreenType[];
    userStates: UserState[];
    vehicleStates: VehicleState[] | undefined;
    transitModes: TransitMode[];
    // Optional: A more complex condition function if needed
    condition: ((currentLeg: ProcessedLegInfo, allLegs: ProcessedLegInfo[]) => boolean) | undefined;
    handler: (params: RuleHandlerParams) => JourneyRuleReturn;
};
