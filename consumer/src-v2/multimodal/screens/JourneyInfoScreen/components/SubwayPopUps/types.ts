export interface SubwayPopUpProps {
    title: string;
    body: string;
}

export interface SubwayPopUpButtonProps {
    title: string;
    testId: string;
    onPress: (() => void) | undefined;
}

export interface SubwayPopUpState {
    popUpProps: SubwayPopUpProps;
    buttonProps: SubwayPopUpButtonProps;
    visible: boolean;
}

export interface GetOTPViewProps {
    setCurrentStage: (stage: DeviceChangeStage) => void;
}

export enum DeviceChangeStage {
    GET_OTP,
    VERIFY_OTP,
}

export interface VerifyOTPViewProps {
    cooldownTime: number;
    isCooldown: boolean;
    startCooldown: () => void;
    onConfirm: () => void;
}

export interface DeviceChangePopUpProps {
    onConfirm: () => void;
}

export interface SubwayErrorConfig {
    title: string;
    body: string;
    buttonTitle: string;
    testId: string;
    onPress: (() => void) | undefined;
}

export interface SubwayErrorConfigs {
    [key: string]: SubwayErrorConfig;
}
