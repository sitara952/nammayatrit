import { DynamicCancellationReasonsConfig, DynamicCancellationTranslationKey } from '../types';

export const defaultDynamicCancellationReasonsConfig: DynamicCancellationReasonsConfig = {
    reasons: [
        {
            code: 'DRIVER_DEMANDED_EXTRA',
            icon: 'DriverCharginExtra',
            translationKey: DynamicCancellationTranslationKey.DRIVER_DEMANDED_EXTRA,
            visibility: {
                type: 'include',
                cities: [],
            },
        },
    ],
};
