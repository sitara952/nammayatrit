import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { TimeEntry } from '../../types/journeyTracking';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';

export interface TimeTableSegment {
    startTime: string;
    endTime: string;
    interval: number;
    description: string;
}

export interface TimeTableInfo {
    info: string;
    mode: MultimodalTravelMode_multimodalTravelMode | undefined;
    time: number;
    formattedTime: string;
}

export type NewTimeTableUIProps = {
    times: TimeEntry[];
    source: string;
    sheetRef: React.RefObject<BottomSheetModal | null> | undefined;
    mode: MultimodalTravelMode_multimodalTravelMode | undefined;
    towardsStation: string | undefined;
    allTowardsStation: string[] | undefined;
    onDismiss: (() => void) | undefined;
};

export type SegmentTimeTableType = Array<{ startTime: number; endTime: number; interval: number; count: number }>;
