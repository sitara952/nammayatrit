import { APIEndpoint, BannerActionType, BannerConfig } from '../types';

export const defaultBannerConfig: Partial<BannerConfig> = {
    // Core
    bannerId: '',
    visibility: true,

    // Content
    title: '',
    description: undefined,
    imageUrl: undefined,
    imagePosition: 'center',

    // Layout / Appearance
    backgroundColor: '#FFFFFF',
    textColor: '#313131',
    dismissible: true,

    swipeToDismiss: false,

    // Auto dismiss
    autoDismiss: false,
    autoDismissDuration: undefined,

    // Primary Button
    primaryButton: {
        text: '',
        visible: true,
        textColor: '#FFFFFF',
        backgroundColor: '#363439',
        actionType: BannerActionType.Dismiss,
        apiEndpoint: APIEndpoint.None,
        inheritParentApi: false,
        callbackFunction: undefined,
        disabled: false,
        nextBannerId: undefined,
    },

    // Secondary Button
    secondaryButton: {
        text: '',
        visible: true,
        textColor: '#000000',
        backgroundColor: '#FFFFFF',
        actionType: BannerActionType.Dismiss,
        apiEndpoint: APIEndpoint.None,
        inheritParentApi: false,
        callbackFunction: undefined,
        disabled: false,
        nextBannerId: undefined,
    },

    // Timing & Accessibility
    displayTiming: {
        showUntil: null,
    },

    accessibility: {
        importanceLevel: 'normal',
        accessibilityLabel: 'Banner',
        accessibilityHint: 'Banner notification',
    },

    priority: 'normal',
};
