import { Action, Resolver } from '@/typescript/utils/common';

export type StageType = 'isLoading' | 'success' | 'failed' | undefined;

export type CollectReferralEarningAction =
    | Action<'HIDE_KEYBOARD'>
    | Action<'VERIFY_VPA_CLICKED'>
    | Action<'GOT_IT_CLICKED'>;

export type CollectReferralEarningUIProps = {
    upiId: string;
    stage: StageType;
    verifyData: {
        icon: React.ReactNode;
        text: string;
        textColor: string;
        bgColor: string;
        borderColor: string;
        subtitleText: string;
        subTitleTextColor: string;
    };
    handleTextChange: (text: string) => void;
    customerFirstRide: boolean | undefined;
    referralYouGet: number;
    crDispatch: Resolver<CollectReferralEarningAction>;
};
