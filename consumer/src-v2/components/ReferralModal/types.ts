import { Action, Resolver } from '@/typescript/utils/common';
import { strings } from 'config-types';

export type ReferralModalAction = Action<'APPLY_REFERRAL_CLICKED'>;

export type ReferralModalUIProps = {
    setReferralCode: React.Dispatch<React.SetStateAction<string>>;
    utmReferralCode: string | undefined;
    validReferralCode: boolean;
    applyReferralError: boolean;
    rmDispatch: Resolver<ReferralModalAction>;
};

export type ReferralModalProps = {
    setReferralApplied: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    utmReferralCode: string | undefined;
};

export type ReferralInputProps = {
    headerText: string | undefined;
    setReferralCode: React.Dispatch<React.SetStateAction<string>>;
    utmReferralCode: string | undefined;
    userLanguageStrings: strings;
    validReferralCode: boolean;
    applyReferralError: boolean;
    rmDispatch: Resolver<ReferralModalAction>;
};
