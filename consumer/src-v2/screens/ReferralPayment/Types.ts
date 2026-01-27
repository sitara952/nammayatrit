import { strings, ThemeTokens } from 'config-types';

export type ReferralPaymentScreenUIProps = {
    themeColors: ThemeTokens;
    onDonePress: () => void;
    userLanguageStrings: strings;
    payoutVpa: string;
    referralAmountToCollect: number;
};
