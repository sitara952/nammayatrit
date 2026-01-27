import { BottomSheetModal } from '@gorhom/bottom-sheet';

export type ReferralInfoModalFlowProps = {
    onClose: () => void;
};

export type ReferralInfoModalUIProps = {
    referralInfoModalRef: React.RefObject<BottomSheetModal | null>;
    referralModalRef: React.RefObject<BottomSheetModal | null>;
    handleTermsPress: () => void;
};
