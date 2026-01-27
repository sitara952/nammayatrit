import { ValidBannerId } from './BannerRegistry';
import { ImageSourcePropType } from 'react-native';

export enum APIEndpoint {
    ReportAcIssue = 'reportACIssueAPICall',
    ReportExtraFare = 'reportExtraFareAPICall',
    None = 'none',
}

export enum BannerActionType {
    Dismiss = 'dismissBanner',
    Chain = 'chain',
    Undo = 'undoBanner',
}

export type ButtonConfig = {
    text: string;
    visible: boolean;
    textColor: string;
    backgroundColor: string;
    actionType: BannerActionType;
    apiEndpoint: APIEndpoint;
    inheritParentApi: boolean;
    callbackFunction: string | undefined;
    disabled: boolean | undefined;
    nextBannerId: ValidBannerId | undefined;
};

export type DisplayTiming = {
    showUntil: number | null;
};

export type Accessibility = {
    importanceLevel: 'low' | 'normal' | 'high';
    accessibilityLabel: string;
    accessibilityHint: string;
};

export type BannerConfig = {
    bannerId: string;
    visibility: boolean;

    parentBannerId: ValidBannerId | null;

    // Content
    title: string;
    description: string | undefined;
    imageUrl: ImageSourcePropType | undefined;

    // Layout / Appearance
    backgroundColor: string;
    textColor: string;
    imagePosition: 'center' | 'flex-down';
    dismissible: boolean;

    // Swipe to dismiss
    swipeToDismiss: boolean;

    // Auto dismiss
    autoDismiss: boolean;
    autoDismissDuration: number | undefined;

    // Buttons
    primaryButton: ButtonConfig;
    secondaryButton: ButtonConfig | undefined;

    // Additional Controls
    displayTiming: DisplayTiming;
    accessibility: Accessibility;
    priority: 'low' | 'normal' | 'high';
};
