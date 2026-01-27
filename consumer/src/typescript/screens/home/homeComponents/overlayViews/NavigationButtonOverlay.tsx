import Button from '@/src-v2/primitives/Button';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import { Icon } from '@/typescript/components/Icon';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import token from '@/typescript/designSystem/tokens';
import {
    selectBottomSheetStage,
    BottomSheetStage,
    setBottomSheetStage,
    clearSession,
    selectSearchedSource,
    selectSearchedStops,
    setActiveInput,
    SearchInput,
    selectGoBackToRental,
    selectChooseRideGoBackStage,
    setFareProductType,
    selectNewFeatureFlags,
    selectFindAnotherDriverContext,
} from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { FC, useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated from 'react-native-reanimated';
import { resetIds } from '@/typescript/state/sharedReducer';
import { selectToken } from '@/typescript/state/client/auth';
import useMapRoute from '@/typescript/Maps/UseMapRouteTS';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { EventName, logEvent } from '@/typescript/utils/logger';
import HyperSdkReact from 'hyper-sdk-react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import { minimizeApp } from '@/typescript/utils/common';
import { useCheckForInterCity } from '@/typescript/hooks/checkForIntercity';
import { selectSearchId } from '@/typescript/state/client/user';
import { selectSelectedPricingItems } from '@/typescript/state/client/search';

interface NavigationButtonOverlayPropsType {
    hideAccessibility: boolean;
    navigateToSearch: () => void;
    setIsTryBoostedSearchModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
}

const NavigationButtonOverlay: FC<NavigationButtonOverlayPropsType> = ({
    hideAccessibility,
    navigateToSearch,
    setIsTryBoostedSearchModalOpen,
    multimodalProps,
}) => {
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const { removeRoute } = useMapRoute(null, undefined);
    const { bottomSheetTopBannerRef } = useRefsContext();
    const searchedSource = useAppSelector(selectSearchedSource);
    const stops = useAppSelector(selectSearchedStops);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const { top } = useSafeAreaInsets();
    const goBackToRental = useAppSelector(selectGoBackToRental);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const chooseRideGoBackStage = useAppSelector(selectChooseRideGoBackStage);
    const { isInterCity } = useCheckForInterCity(searchedSource, stops);
    const isAmbulance = useAppSelector(state => state.session.fareProductType === 'AMBULANCE');
    const { enableAddStop } = useAppSelector(selectNewFeatureFlags);
    const findAnotherDriverContext = useAppSelector(selectFindAnotherDriverContext);
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, searchId));
    const resetSearchStageData = () => {
        if (!enableAddStop) {
            dispatch(clearSession(['currentLocation', 'hasRequestedLocationPermission', 'hasRequestedForeGps']));
        }
        resetIds(userToken, null, dispatch);
    };

    const handleBackPress = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        switch (bottomSheetStage) {
            case BottomSheetStage.Home: {
                minimizeApp();
                return true;
            }
            case BottomSheetStage.Search: {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'bckPress_search' }));
                return true;
            }
            case BottomSheetStage.ConfirmPickup: {
                if (goBackToRental) {
                    resetSearchStageData();
                    navigation.navigate(
                        'ServicesTab',
                        {
                            screen: 'extendedBookingNavigator',
                            params: {
                                screen: 'rentalsScreen',
                            },
                        },
                        { pop: true },
                    );
                } else {
                    bottomSheetTopBannerRef.current = false;
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'bckPress_cfrmPckup' }));
                    dispatch(setActiveInput(SearchInput.Destination));
                }
                return true;
            }
            case BottomSheetStage.IntercitySearchDetails: {
                navigateToSearch();
                return true;
            }
            case BottomSheetStage.ChooseRide: {
                logEvent(EventName.NY_USER_ESTIMATE_CANCEL_SEARCH);
                removeRoute('defaultRoute');
                dispatch(setActiveInput(SearchInput.Destination));
                if (isInterCity) {
                    dispatch(
                        setBottomSheetStage({
                            stage: BottomSheetStage.IntercitySearchDetails,
                            src: 'bckPress_intercity',
                        }),
                    );
                } else if (goBackToRental) {
                    navigation.navigate(
                        'ServicesTab',
                        {
                            screen: 'extendedBookingNavigator',
                            params: {
                                screen: 'rentalsScreen',
                            },
                        },
                        { pop: true },
                    );
                } else {
                    const newStage = chooseRideGoBackStage;

                    if (isAmbulance) {
                        dispatch(setFareProductType('AMBULANCE'));
                    }
                    bottomSheetTopBannerRef.current = false;
                    if (newStage !== null) {
                        dispatch(setBottomSheetStage({ stage: newStage, src: 'bckPress_chooseRide' + newStage }));
                    } else {
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'bckPress_chooseRide' }));
                    }
                }
                resetSearchStageData();
                return true;
            }
            case BottomSheetStage.LookingForRides: {
                // Log event if user came from find another driver
                if (findAnotherDriverContext) {
                    logEvent(EventName.NY_USER_FIND_ANOTHER_DRIVER_SEARCH_CROSS_CLICKED, {
                        RideId: findAnotherDriverContext.rideId,
                    });
                }
                setIsTryBoostedSearchModalOpen(true);
                return true;
            }
            case BottomSheetStage.RetryBoostedSearch: {
                bottomSheetTopBannerRef.current = false;
                if (multimodalProps) {
                    resetIds(userToken, null, dispatch);
                    navigation.popTo('mainTabNavigation', {
                        screen: 'liveTab_homeScreen',
                        params: {
                            journeyId: null,
                            multimodalProps: multimodalProps,
                        },
                    });
                } else {
                    const isACCabRide = selectedPricingItems?.some(item => item.isAirConditioned);
                    const isBikeRide = selectedPricingItems?.some(item =>
                        item.vehicleVariant?.toLowerCase().includes('bike'),
                    );
                    if (isACCabRide) {
                        logEvent(EventName.NY_USER_AC_CAB_RIDE_SEARCH_DROPOFF);
                    }
                    if (isBikeRide) {
                        logEvent(EventName.NY_USER_BIKE_RIDE_SEARCH_DROPOFF);
                    }
                    logEvent(EventName.NY_USER_SEARCH_DROPOFF);
                    resetSearchStageData();
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'bckPress_retryBoostedSearch' }));
                }
                return true;
            }
            default: {
                return false;
            }
        }
    }, [bottomSheetStage, chooseRideGoBackStage, selectedPricingItems]);

    const hardwareBackPress = useCallback(() => {
        if (
            Platform.OS === 'android' &&
            (HyperSdkReact.onBackPressed('paymentPage') || HyperSdkReact.onBackPressed('hyperKey'))
        ) {
            return true;
        }
        return handleBackPress();
    }, [handleBackPress]);

    // Use the custom hook for debounced back press handling
    useDebounceBackPress(hardwareBackPress, 2000, [hardwareBackPress]);

    // Determine accessibility label
    const accessibilityLabel = (() => {
        switch (bottomSheetStage) {
            case BottomSheetStage.LookingForRides:
                return 'Cancel search';
            default:
                return 'Go back';
        }
    })();

    // Determine icon based on bottom sheet stage
    const icon =
        bottomSheetStage === BottomSheetStage.ConfirmPickup ? (
            <LeftArrow />
        ) : (
            <Icon
                icon={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                size={16}
                color={token?.text['text-base']}
            />
        );

    if (
        bottomSheetStage !== BottomSheetStage.Search &&
        bottomSheetStage !== BottomSheetStage.IntercitySearchDetails &&
        bottomSheetStage !== BottomSheetStage.Home
    ) {
        return (
            <Animated.View style={[styles.buttonContainer, { top }]}>
                <Button
                    testID={`home_navigation_${bottomSheetStage}_back`}
                    accessible={!hideAccessibility}
                    accessibilityLabel={accessibilityLabel}
                    accessibilityRole="imagebutton"
                    size="md"
                    type="secondary"
                    prefix={icon}
                    onPress={handleBackPress}
                    style={styles.buttonShadow}
                />
            </Animated.View>
        );
    }
    return undefined;
};

export default NavigationButtonOverlay;

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        left: 16,
        zIndex: -10,
    },
    buttonShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1,
    },
});
