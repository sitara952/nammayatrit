import { StyleType } from '@/typescript/types/CommonTypes';
import { Action } from '@/typescript/utils/common';

export type BoostCardAction = Action<'ON_BUTTON_CLICK'>;

export interface BoostCardProps {
    additionalFare: number | undefined;
    setAdditionalFare: React.Dispatch<React.SetStateAction<number | undefined>>;
    selectedExpandedData: string[];
    setSelectedExpandedData: React.Dispatch<React.SetStateAction<string[]>>;
    containerStyle: StyleType | undefined;
    setHeight: React.Dispatch<React.SetStateAction<number>>;
    updateInitialSelectedVehicles?: React.Dispatch<React.SetStateAction<string[]>>;
    tipOptions: number[];
    currentlySelectedIds: string[];
}
