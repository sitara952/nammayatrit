import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';

export type JourneyPlanScreenAction =
    | Action<'SWITCH_MODE', { legOrder: number; newMode: MultimodalTravelMode_multimodalTravelMode }>
    | Action<'SHOW_RIDE_OPTIONS', { legOrder: number }>
    | Action<'GO_BACK'>;

export type JourneyPlanScreenProps = {
    mpDispatch: Resolver<JourneyPlanScreenAction>;
    legs: TrackedLegInfoStaticInfo[];
};
