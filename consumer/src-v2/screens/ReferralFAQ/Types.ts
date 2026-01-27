import { ReferralPayoutConfigV2 } from '@/src-v2/systems/configs/types';
import { strings, ThemeTokens } from 'config-types';

export type ReferralFAQScreenProps = {
    onBackPress: () => void;
    userLanguageStrings: strings;
    themeColors: ThemeTokens;
    referralPayoutConfigV2: ReferralPayoutConfigV2;
};
