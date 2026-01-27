import { BottomSheetModal } from '@gorhom/bottom-sheet';

export enum BusinessProfileStage {
    BUSINESS_PROFILE_OVERVIEW = 'BUSINESS_PROFILE_OVERVIEW',
    EMAIL_ENTRY = 'EMAIL_ENTRY',
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
    VERIFICATION_SUCCESS = 'VERIFICATION_SUCCESS',
    VERIFICATION_FAILED = 'VERIFICATION_FAILED',
    VERIFICATION_TIMEOUT = 'VERIFICATION_TIMEOUT',
}

export interface BusinessProfileUIProps {
    stage: BusinessProfileStage;
    email: string;
    otp: string;
    onEmailChange: (email: string) => void;
    onOtpChange: (otp: string) => void;
    onVerifyEmail: () => void;
    onResendOtp: () => void;
    onResendEmail: () => void;
    onReportIssue: () => void;
    onBookBusinessRide: () => void;
    onBack: () => void;
    onEditEmail: () => void;
    isLoading: boolean;
    otpError: boolean;
    resendOtpTimer: number;
    resendOtpEnabled: boolean;
    resendAttempts: number;
    isBusinessEmailVerified: boolean | undefined;
    hasBusinessEmail: boolean;
    onDeleteProfile: () => void;
    showEmailError: boolean;
    businessEmail: string | undefined;
    deleteProfileModalRef: React.RefObject<BottomSheetModal | null>;
    isDeleteModalVisible: boolean;
    setIsDeleteModalVisible: (visible: boolean) => void;
    onConfirmDeleteProfile: () => void;
    onCancelDeleteProfile: () => void;
}
