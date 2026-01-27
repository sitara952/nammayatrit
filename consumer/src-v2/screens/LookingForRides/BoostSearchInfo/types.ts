import { StyleType } from '@/typescript/types/CommonTypes';
import { Action, Resolver } from '@/typescript/utils/common';

export type BoostSearchInfoAction = Action<'ON_EDIT_CLICKED'>;

export interface BoostSearchInfoUIProps {
    containerStyle: StyleType | undefined;
    customerTip: number | undefined;
    selectedItemName: string;
    rcsDispatch: Resolver<BoostSearchInfoAction>;
    isEditButtonDisabled: boolean;
}
