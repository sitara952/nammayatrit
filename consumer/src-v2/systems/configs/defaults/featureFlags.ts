import { TrackingMode, FeatureFlags } from '../types';

export const defaultFeatureFlagsConfig: Record<TrackingMode, FeatureFlags> = {
    Extreme: {
        rideToolCenter: {
            duringPickup: {
                walkDirection: true,
                googleNavigation: false,
                shareToFriends: false,
                safetyTools: false,
            },
            duringRide: {
                googleNavigation: false,
                walkDirection: false,
                shareToFriends: false,
                safetyTools: false,
            },
        },
        rideStartContactTrustedContacts: false,
        editDestination: false,
        postRideStartFragment: true,
        endRideShowFareSplit: false,
        showDriverProfile: false,
        favouriteDriver: false,
        showDriverDetailsInFeedback: false,
        showNeedHelpInFeedback: false,
        showACRidePopup: false,
        myRidesDetails: {
            showHelpAndSupport: false,
            showRideDetails: false,
            showEstimate: true,
        },
        feedbackPills: {
            driverRelated: false,
            safetyRelated: true,
            fareRelated: false,
        },
        onRideBottomSheet: {
            viewMapButton: false,
            hamburgerMenu: true,
        },
    },
    Normal: {
        rideToolCenter: {
            duringPickup: {
                googleNavigation: false,
                walkDirection: true,
                shareToFriends: true,
                safetyTools: true,
            },
            duringRide: {
                googleNavigation: true,
                walkDirection: false,
                shareToFriends: true,
                safetyTools: true,
            },
        },
        rideStartContactTrustedContacts: true,
        editDestination: true,
        postRideStartFragment: false,
        endRideShowFareSplit: true,
        favouriteDriver: true,
        showDriverProfile: true,
        showDriverDetailsInFeedback: true,
        showNeedHelpInFeedback: true,
        showACRidePopup: true,
        myRidesDetails: {
            showHelpAndSupport: true,
            showRideDetails: true,
            showEstimate: false,
        },
        feedbackPills: {
            driverRelated: true,
            safetyRelated: true,
            fareRelated: true,
        },
        onRideBottomSheet: {
            viewMapButton: true,
            hamburgerMenu: true,
        },
    },
    Moderate: {
        rideToolCenter: {
            duringPickup: {
                googleNavigation: false,
                walkDirection: true,
                shareToFriends: false,
                safetyTools: false,
            },
            duringRide: {
                googleNavigation: true,
                walkDirection: false,
                shareToFriends: false,
                safetyTools: false,
            },
        },
        rideStartContactTrustedContacts: false,
        editDestination: true,
        postRideStartFragment: true,
        endRideShowFareSplit: true,
        favouriteDriver: false,
        showDriverProfile: false,
        showDriverDetailsInFeedback: true,
        showNeedHelpInFeedback: false,
        showACRidePopup: true,
        myRidesDetails: {
            showHelpAndSupport: true,
            showRideDetails: true,
            showEstimate: false,
        },
        feedbackPills: {
            driverRelated: true,
            safetyRelated: true,
            fareRelated: false,
        },
        onRideBottomSheet: {
            viewMapButton: false,
            hamburgerMenu: true,
        },
    },
};
