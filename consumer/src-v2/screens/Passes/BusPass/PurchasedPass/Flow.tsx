import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/typescript/state/hooks';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { selectUserProfile } from '@/typescript/state/client/user';
import { useCachedPurchasedPasses } from '@/src-v2/hooks/useCachedPurchasedPasses';
import type { purchasedPassAPIEntity } from '@/readOnly/api/types/PurchasedPassAPIEntity.gen';
import { PurchasedPass } from './UI';
import { useMultimodalPassSwitchDeviceIdPostMutation } from '@/api/integrations/rtk/MultimodalPassSwitchDeviceIdPost';
import { BusPassProps } from '../components/passes/BusPass';
import { NativeModules, Platform, Dimensions } from 'react-native';
import ScreenGuard from 'react-native-screenguard';
import Config from 'react-native-config';
import { selectAppConfig, selectNewFeatureFlags } from '@/typescript/state/client/session';
import { getBestPossibleLocation } from '@/typescript/utils/location';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useMultimodalPassPurchasedPassIdVerifyPostMutation } from '@/api/integrations/rtk/MultimodalPassPurchasedPassIdVerifyPost';
import { useMultimodalPassActivateTodayPassNumberPostMutation } from '@/api/integrations/rtk/MultimodalPassActivateTodayPassNumberPost';
import { formatDateToYYYYMMDD } from '../utils/passUtils';
import { useRefsContext } from '@/typescript/context/RefsContext';

const { AppInfoModule } = NativeModules;

export const PurchasedPassFlow = ({
    handleRenew,
    onNavigateToBuyPass,
}: {
    handleRenew: () => void;
    onNavigateToBuyPass: () => void;
}) => {
    const navigation = useNavigation<NavigationProp<MainNavigationParamList>>();
    const [switchDeviceMutation] = useMultimodalPassSwitchDeviceIdPostMutation();
    const userProfile = useAppSelector(selectUserProfile);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const [imeiNumber, setImeiNumber] = useState<string | null>(null);
    const [isPollingForDeviceSwitch, setIsPollingForDeviceSwitch] = useState(false);
    const [isVerifyLoading, setIsVerifyLoading] = useState(false);
    const [verifyPassMutation] = useMultimodalPassPurchasedPassIdVerifyPostMutation();
    const [locationData, setLocationData] = useState<{
        currentLat: number | undefined;
        currentLon: number | undefined;
    }>({
        currentLat: undefined,
        currentLon: undefined,
    });
    const [activationPassNo, setActivationPassNo] = useState<string | null>(null);

    // Fetch device ID on mount
    useEffect(() => {
        const fetchDeviceId = async () => {
            try {
                const id = await AppInfoModule.getUTSId();
                console.warn('Fetched device ID:', id);
                setImeiNumber(id);
            } catch (error) {
                console.error('Error fetching device ID:', error);
            }
        };
        fetchDeviceId();
    }, []);

    // Fetch location data once when component mounts
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const location = await getBestPossibleLocation();
                setLocationData({
                    currentLat: location.coords.latitude,
                    currentLon: location.coords.longitude,
                });
            } catch (locationError) {
                console.error('Failed to get current location:', locationError);
                setLocationData({
                    currentLat: undefined,
                    currentLon: undefined,
                });
            }
        };
        fetchLocation();
    }, []);

    const { data: purchasedPasses, isLoading, isCachedData: _isCachedData, refetch } = useCachedPurchasedPasses(true);
    const [activateToday] = useMultimodalPassActivateTodayPassNumberPostMutation();
    const { busPassActivationModalRef } = useRefsContext();

    useFocusEffect(
        useCallback(() => {
            if (isLoading) {
                return;
            }
            const timeoutId = setTimeout(() => {
                try {
                    refetch();
                } catch (error) {
                    console.warn('Error Occurred ', error);
                }
            }, 1000);
            return () => clearTimeout(timeoutId);
        }, [refetch, isLoading]),
    );

    // Get the most recent active pass or the first pass if available
    const _activePass = purchasedPasses?.find(pass => pass.status === 'Active') || purchasedPasses?.[0];

    const profilePic = userProfile?.profilePicture;

    const handleVerifyPress = (passId: string) => {
        setIsVerifyLoading(true);
        logEvent(EventName.USER_CLICKED_VERIFY_PASS);
        navigation.navigate('HomeTab', {
            screen: 'busOtpFlow',
            params: {
                state: 'Pass',
                params: {
                    legInfo: undefined,
                    journeyId: '',
                    legOrder: 0,
                    subLegOrder: 0,
                    autoFillOtp: undefined,
                    type: 'Pass',
                },
                displaySearchBar: false,
                activePassId: passId,
                locationData: locationData,
            },
        });
        // Reset loading after navigation
        setTimeout(() => setIsVerifyLoading(false), 500);
    };

    const handleRefetchPassData = async () => {
        setIsVerifyLoading(true);
        try {
            await refetch();
        } finally {
            setIsVerifyLoading(false);
        }
    };

    // Handle device switch confirmation
    const handleSwitchConfirm = async () => {
        if (!imeiNumber) {
            console.error('No device ID available');
            return;
        }

        try {
            console.warn('🔄 Device switch confirmed - calling API to switch device');
            console.warn('🔄 Device ID:', imeiNumber);

            const result = await switchDeviceMutation({
                body: { deviceId: undefined, imeiNumber: imeiNumber },
            });

            if ('error' in result) {
                console.error('Error switching device:', result.error);
                return;
            }

            console.warn('✅ Device switched successfully - starting polling for updates');
            setIsPollingForDeviceSwitch(true);

            // Poll until deviceMismatch becomes false
            const pollForUpdate = async () => {
                const maxAttempts = 10; // Poll for up to 30 seconds (10 attempts * 3 seconds)

                const poll = async (currentAttempt: number): Promise<void> => {
                    console.warn(`🔄 Polling attempt ${currentAttempt}/${maxAttempts} for device mismatch update`);

                    try {
                        const refetchResult = await refetch().unwrap();

                        const hasDeviceMismatch = refetchResult?.some(pass => pass.deviceMismatch === true);

                        if (!hasDeviceMismatch) {
                            console.warn('✅ Device mismatch resolved - stopping polling');
                            setIsPollingForDeviceSwitch(false);
                            return;
                        }

                        if (currentAttempt >= maxAttempts) {
                            console.warn('⚠️ Max polling attempts reached - device mismatch may still exist');
                            setIsPollingForDeviceSwitch(false);
                            return;
                        }

                        // Continue polling
                        setTimeout(() => poll(currentAttempt + 1), 3000);
                    } catch (error) {
                        console.error('Error during polling refetch:', error);
                        if (currentAttempt >= maxAttempts) {
                            console.warn('⚠️ Max polling attempts reached due to errors');
                            setIsPollingForDeviceSwitch(false);
                            return;
                        }
                        setTimeout(() => poll(currentAttempt + 1), 3000);
                    }
                };

                // Start polling
                poll(1);
            };

            await pollForUpdate();
        } catch (error) {
            console.error('Error in handleSwitchConfirm:', error);
        }
    };

    const onBuyNewPass = () => {
        // Navigate to BuyPassUI by triggering parent state change
        // This clears the purchased passes view and shows the buy screen
        onNavigateToBuyPass();
    };

    const handleHistoryPress = useCallback(() => {
        navigation.navigate('PassesTab', { screen: 'passHistory' });
    }, [navigation]);

    const handleNavigateToSupport = useCallback(() => {
        navigation.navigate('ProfileTab', {
            screen: 'helpAndSupportNavigator',
            params: {
                screen: 'metroIssueFaqScreen',
                params: { SelectedOption: 'BUS_PASS' },
            },
        });
    }, [navigation]);

    const handleActivateToday = useCallback(
        async (passNo: string) => {
            try {
                const dateStr = formatDateToYYYYMMDD(new Date());
                await activateToday({
                    passNumber: parseInt(passNo, 10),
                    date: dateStr,
                }).unwrap();
                handleRefetchPassData();
            } catch (error) {
                console.error('Failed to activate pass today:', error);
            }
        },
        [activateToday, handleRefetchPassData],
    );

    const handleOpenActivationModal = useCallback(
        (passNo: string) => {
            setActivationPassNo(passNo);
            busPassActivationModalRef.current?.present();
        },
        [busPassActivationModalRef],
    );

    const handleConfirmActivation = useCallback(async () => {
        if (activationPassNo) {
            busPassActivationModalRef.current?.dismiss();
            logEvent(EventName.USER_CLICKED_RENEW_BUS_PASS);
            setTimeout(() => {
                handleActivateToday(activationPassNo);
            }, 300);
        }
    }, [activationPassNo, handleActivateToday, busPassActivationModalRef]);

    const handleCancelActivation = useCallback(() => {
        busPassActivationModalRef.current?.dismiss();
        setActivationPassNo(null);
    }, [busPassActivationModalRef]);

    const purchasedPassesData: BusPassProps[] =
        purchasedPasses?.map((pass: purchasedPassAPIEntity) => ({
            passCode: pass.passEntity?.passDetails?.code || '',
            passNo: pass.passNumber || '',
            daysToExpire: pass.daysToExpire,
            isGoldPass: pass.passEntity?.passDetails?.code === 'GOLD1000',
            profileImageUri: pass.profilePicture ?? profilePic ?? '',
            fleetNo: pass.lastVerifiedVehicleNumber || '',
            isPreBooked: pass.status === 'PreBooked',
            isExpired: pass.status === 'Expired',
            validFrom: (pass.startDate && new Date(pass.startDate).getTime()) || 0,
            amount: pass.passEntity?.passDetails?.amount || 0,
            validTill: (pass.expiryDate && new Date(pass.expiryDate).getTime()) || 0,
            qrValue: pass.id || '',
            purchasedPassId: pass.id || '',
            onVerifyPress: () => handleVerifyPress(pass.id || ''),
            onRefetchPassData: handleRefetchPassData,
            onRenewPress: handleRenew,
            showDeviceSwitchFlow: pass.deviceMismatch === true,
            onSwitchConfirm: handleSwitchConfirm,
            onBuyNewPass: onBuyNewPass,
            deviceSwitchAllowed: pass.deviceSwitchAllowed === true,
            isDeviceSwitchPolling: isPollingForDeviceSwitch,
            futureRenewals: pass.futureRenewals || [],
            onPreBookedPassPress: handleHistoryPress,
            isVerifyLoading: isVerifyLoading,
            isPhotoPending: pass.status === 'PhotoPending',
            onUploadPhotoPress: () => {
                navigation.navigate('PassesTab', {
                    screen: 'takePhoto',
                    params: {
                        uploadMode: true,
                        purchasedPassId: pass.id,
                        selectedPass: pass.passEntity?.passDetails,
                        date: undefined,
                        offer: undefined,
                    },
                });
            },
            isAutoVerified: pass.isAutoVerified || false,
            onActivateTodayPress: () => {
                handleOpenActivationModal(pass.passNumber);
            },
        })) || [];

    useFocusEffect(
        useCallback(() => {
            const shouldAutoActivate = newFeatureFlags?.autoActivatePass ?? false;
            if (!shouldAutoActivate) {
                console.info('⛔️ Auto-activate for passes is disabled by feature flag');
                return;
            }

            if (
                locationData.currentLat !== undefined &&
                locationData.currentLon !== undefined &&
                purchasedPasses &&
                purchasedPasses[0]?.status === 'Active' &&
                purchasedPasses[0]?.lastVerifiedVehicleNumber === undefined
            ) {
                const passId = purchasedPasses[0]?.id;
                if (passId) {
                    console.info('🚀 Initiating verifyPassMutation for pass ID:', passId);
                    verifyPassMutation({
                        purchasedPassId: passId,
                        body: {
                            vehicleNumber: '',
                            currentLat: locationData.currentLat,
                            currentLon: locationData.currentLon,
                            stopId: undefined,
                            autoActivated: true,
                        },
                    })
                        .then(() => {
                            setTimeout(() => {
                                console.info('🔄 Calling refetch to update pass data');
                                refetch().then(() => {
                                    console.info('✅ Refetch completed');
                                });
                            }, 1000);
                        })
                        .catch(error => {
                            console.error('❌ Verify mutation failed:', error);
                        });
                }
            }
        }, [
            locationData.currentLat,
            locationData.currentLon,
            purchasedPasses,
            verifyPassMutation,
            refetch,
            newFeatureFlags,
        ]),
    );

    return (
        <PurchasedPass
            purchasedPasses={purchasedPassesData || []}
            isLoading={isLoading}
            onHistoryPress={handleHistoryPress}
            onNavigateToSupport={handleNavigateToSupport}
            activationPassNo={activationPassNo}
            onConfirmActivation={handleConfirmActivation}
            onCancelActivation={handleCancelActivation}
        />
    );
};

// Protect screenshot for Passes similar to ticket flows

interface PurchasedPassFlowWithScreenGuardProps {
    handleRenew: () => void;
    onNavigateToBuyPass: () => void;
}

export const PurchasedPassFlowWithScreenGuard = (props: PurchasedPassFlowWithScreenGuardProps) => {
    const appConfig = useAppSelector(selectAppConfig);
    const isProd = Config['SDK_ENV'] === 'production';

    useFocusEffect(
        useCallback(() => {
            if (!isProd) return () => {};

            try {
                if (Platform.OS === 'ios') {
                    if (appConfig.assets.screenShotGuardImageUri) {
                        const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
                        ScreenGuard.registerWithImage({
                            source: { uri: appConfig.assets.screenShotGuardImageUri },
                            width: SCREEN_WIDTH,
                            height: SCREEN_HEIGHT,
                            alignment: 0,
                        });
                    } else {
                        ScreenGuard.register({ backgroundColor: '#000000' });
                    }
                } else {
                    ScreenGuard.registerWithoutEffect();
                }
            } catch {
                ScreenGuard.unregister();
            }

            return () => {
                ScreenGuard.unregister();
            };
        }, [appConfig]),
    );

    return <PurchasedPassFlow {...props} />;
};
