import { strings } from 'config-types';
import { SubwayErrorPopUpType } from '@/src-v2/multimodal/components/JourneyPayment/hooks/useSubwayErrors';
import { SubwayErrorConfigs } from './types';

export const createSubwayErrorConfigs = (
    userLanguageStrings: strings,
    onMoreOptions: (() => void) | undefined,
    errorMessage: string | undefined,
): SubwayErrorConfigs => ({
    [SubwayErrorPopUpType.UnknownError]: {
        title: userLanguageStrings.TrainBookingUnavailable,
        body: errorMessage ?? userLanguageStrings.WeCouldntBookTrainAtThisTime,
        buttonTitle: onMoreOptions ? userLanguageStrings.MoreOptions : userLanguageStrings.Gotit,
        testId: onMoreOptions ? 'unknow-error-more-options' : 'unknow-error-got-it',
        onPress: onMoreOptions,
    },
    [SubwayErrorPopUpType.DeveloperSettingsError]: {
        title: userLanguageStrings.DeveloperSettingsDetected,
        body: errorMessage ?? userLanguageStrings.ForSecurityReasonsTrainBookingIsDisabled,
        buttonTitle: onMoreOptions ? userLanguageStrings.MoreOptions : userLanguageStrings.Gotit,
        testId: onMoreOptions ? 'developer-settings-error-more-options' : 'developer-settings-error-got-it',
        onPress: onMoreOptions,
    },
});
