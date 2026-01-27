import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
import { ReferralPayoutConfigV2 } from '@/src-v2/systems/configs/types';
import { Action, Resolver } from '@/typescript/utils/common';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { strings, ThemeTokens } from 'config-types';

export type bodyHeaderItemData = 'Total Earnings' | 'Pending Earnings' | 'Referral Earnings' | undefined;

export type bodyHeaderItem = {
    title: string;
    subTitle: string;
    btnText: string;
    btnColor: string;
    btnBorderColor: string;
    btnAction: () => void;
    type: bodyHeaderItemData;
};

export type ReferralScreenAction =
    | Action<'HEADER_BACK_PRESS'>
    | Action<'COLLECT_NOW_CLICKED'>
    | Action<'FAQ_TEXT_PRESS'>
    | Action<'SHARE_CLICKED'>
    | Action<'QR_ICON_CLICKED'>;

export type ReferralScreenUIProps = {
    userProfile: profileRes | null;
    referralAppliedFromStore: boolean | undefined;
    referralModalRef: React.RefObject<BottomSheetModal | null>;
    qrViewModalRef: React.RefObject<BottomSheetModal | null>;
    collectReferralEarningModalRef: React.RefObject<BottomSheetModal | null>;
    utmReferralCode: string;
    rfDispatch: Resolver<ReferralScreenAction>;
    getBodyHeaderData: () => bodyHeaderItem;
    referralPayoutConfigV2: ReferralPayoutConfigV2;
};

export type CodeAndShareButtonViewProps = {
    userProfile: profileRes | null;
    themeColors: ThemeTokens;
    userLanguageStrings: strings;
    rfDispatch: Resolver<ReferralScreenAction>;
};
