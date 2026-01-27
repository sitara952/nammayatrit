import React, { useEffect, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import MapProvider from '@/typescript/Maps/MapProvider.tsx';
import { selectAppConfig, selectLastKnownLocation } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { HomeScreen_ } from './Flow';
import { latLng } from '@/helpers/externalModules/GMap/ReactMap.gen';
import { Profiler } from '@/typescript/hooks/useComponentProfiler';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { ReferralModalAfterOnboarding } from '@/src-v2/components/ReferralModalAfterOnboarding/UI';
import { MMKVKey, setStringItem, getStringItem, getNumberItem, setNumberItem } from '@/typescript/utils/MMKV';
import { selectReferralApplied, selectUserProfile } from '@/typescript/state/client/user';
import { selectReferralPayoutConfigV2 } from '@/typescript/state/client/session';
import { useDeepLinking } from '@/typescript/screens/home/hooks/useDeepLinking';
import { MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CreateBusinessProfileModal from '@/typescript/components/CreateBusinessProfileModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';

const HomeScreen: React.FC<{ multimodalProps: MultimodalTaxiTrackingProps | undefined }> = ({ multimodalProps }) => {
    const lastKnownLocation = useAppSelector(selectLastKnownLocation);
    const { referralModalAfterOnboardingRef } = useRefsContext();
    const { referralModalRef } = useDeepLinking();
    const businessProfileModalRef = useRef<BottomSheetModal | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const userProfile = useAppSelector(selectUserProfile);
    const isReferralApplied = useAppSelector(selectReferralApplied);
    const appConfig = useAppSelector(selectAppConfig);
    const referralPayoutConfigV2 = useAppSelector(selectReferralPayoutConfigV2);
    const businessProfileConfig = appConfig.flowConfig.businessProfileConfig;

    useEffect(() => {
        const currentDate = new Date();
        const today = currentDate.toDateString();

        const lastShownDate = getStringItem(MMKVKey.TAKE_RIDE_MODAL_LAST_SEEN_DATE) || '';
        if (
            userProfile?.isPayoutEnabled &&
            isReferralApplied &&
            !userProfile?.hasTakenRide &&
            lastShownDate !== today &&
            (referralPayoutConfigV2?.theyGet ?? 0) > 0
        ) {
            const timer = setTimeout(() => {
                referralModalRef?.current?.dismiss();
                referralModalAfterOnboardingRef?.current?.present();
                setStringItem(MMKVKey.TAKE_RIDE_MODAL_LAST_SEEN_DATE, today);
            }, 100);

            return () => clearTimeout(timer);
        }
        return () => {};
    }, [
        userProfile?.isPayoutEnabled,
        MMKVKey.TAKE_RIDE_MODAL_LAST_SEEN_DATE,
        MMKVKey.CUSTOMER_FIRST_RIDE,
        isReferralApplied,
        referralPayoutConfigV2?.theyGet,
    ]);

    useEffect(() => {
        if (!userProfile) {
            return undefined;
        }

        // Check if business profile feature is enabled for the current city
        if (!businessProfileConfig?.enableBusinessProfile) {
            return undefined;
        }

        const shouldShowModal =
            userProfile.businessEmail == null &&
            (userProfile.businessProfileVerified == null || userProfile.businessProfileVerified === false);

        if (!shouldShowModal) {
            return undefined;
        }

        // Check if 30 days have passed since last shown
        const lastShownTimestamp = getNumberItem(MMKVKey.BUSINESS_PROFILE_MODAL_LAST_SHOWN);
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const now = Date.now();

        // Show modal if never shown before or 30 days have passed
        const shouldShowBasedOnTime = !lastShownTimestamp || now - lastShownTimestamp >= thirtyDaysInMs;

        if (shouldShowBasedOnTime) {
            const timer = setTimeout(() => {
                businessProfileModalRef.current?.present();
                setNumberItem(MMKVKey.BUSINESS_PROFILE_MODAL_LAST_SHOWN, now);
            }, 500);

            return () => clearTimeout(timer);
        }
        return undefined;
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [userProfile, businessProfileConfig]);

    const initialCoordinate = appConfig.merchantData.initialCoordinate;

    return (
        <Animated.View style={tailwind.style('relative flex-1')} accessible={false}>
            <MapProvider
                initialCoordinate={
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    {
                        latitude: lastKnownLocation?.lat ?? initialCoordinate.latitude,
                        longitude: lastKnownLocation?.lng ?? initialCoordinate.longitude,
                    } as latLng
                }
                mapId={'MapBeforeRide'}
                fitToMapElementFlag={true}>
                <HomeScreen_ multimodalProps={multimodalProps} />
            </MapProvider>

            <PopUpModal
                sheetRef={referralModalAfterOnboardingRef}
                handleComponent={null}
                enableDynamicSizing={true}
                keyboardBlurBehavior="restore"
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}
                activeOffsetX={undefined}
                activeOffsetY={undefined}
                failOffsetY={undefined}
                failOffsetX={undefined}
                simultaneousHandlers={undefined}
                waitFor={undefined}>
                <ReferralModalAfterOnboarding />
            </PopUpModal>
            <PopUpModal
                sheetRef={businessProfileModalRef}
                handleComponent={null}
                enableDynamicSizing={true}
                keyboardBlurBehavior="restore"
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}
                activeOffsetX={undefined}
                activeOffsetY={undefined}
                failOffsetY={undefined}
                failOffsetX={undefined}
                simultaneousHandlers={undefined}
                waitFor={undefined}
                onDismiss={() => {
                    const lastShown = getNumberItem(MMKVKey.BUSINESS_PROFILE_MODAL_LAST_SHOWN);
                    if (!lastShown) {
                        setNumberItem(MMKVKey.BUSINESS_PROFILE_MODAL_LAST_SHOWN, Date.now());
                    }
                }}>
                <CreateBusinessProfileModal
                    closeModal={() => {
                        businessProfileModalRef.current?.dismiss();
                    }}
                    onGetStarted={() => {
                        businessProfileModalRef.current?.dismiss();
                        navigation.navigate('ProfileTab', {
                            screen: 'businessProfileScreen',
                            params: { isBusinessProfileVerified: false },
                        });
                    }}
                    shouldNavigate={false}
                />
            </PopUpModal>
        </Animated.View>
    );
};

export const ProfiledHomeScreen = ({
    multimodalProps,
}: {
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
}) => {
    return (
        <Profiler componentName="HomeScreen">
            <HomeScreen multimodalProps={multimodalProps} />
        </Profiler>
    );
};
