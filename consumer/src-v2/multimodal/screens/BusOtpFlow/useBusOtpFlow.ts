import {
    useLazyPublicTransportVehicleDataVehicleTypeVehicleNumberGetQuery,
    publicTransportVehicleDataVehicleTypeVehicleNumberGetWithParams,
} from '../../../../src/api/integrations/rtk/PublicTransportVehicleDataVehicleTypeVehicleNumberGet';
import { useRef, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setBusOtpData, setBusRouteData } from './busOtp';
import {
    sortStationsBySequence,
    findNearestStationForBusOtp,
    getUniqueStations,
    computeFilteredRouteSections,
} from './utils';
import { selectValidBusOtpLastClickLocation } from '@/typescript/state/client/session';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { publicTransportData } from '@/readOnly/api/types/PublicTransportData.gen';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { EventPrefix } from '@/typescript/utils/loggerEnums';
import { logPrefixEvent } from '@/typescript/utils/logger';
import { getCachedPurchasedPasses } from '@/src-v2/screens/Passes/BusPass/utils/passCache';

export const useBusOtpFlow = (
    setIsWrongOtp: React.Dispatch<React.SetStateAction<boolean>>,
    setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>,
    onError: () => void,
    onWrongOtp: () => void,
    _onFleetRouteMapMissing: (otp: string) => void,
    onCompleteCallback: () => void,
) => {
    const dispatch = useDispatch();
    const currentOtpRef = useRef<string | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const storedLoc = useAppSelector(selectValidBusOtpLastClickLocation);
    const { busOtpSearchBottomSheetRef, touristBusPassBottomSheetRef } = useRefsContext();

    const [isLoading, setIsLoading] = useState(false);

    const [
        triggerPublicTransportVehicleDataVehicleTypeVehicleNumberGet,
        { error: queryError, isSuccess: querySuccess },
    ] = useLazyPublicTransportVehicleDataVehicleTypeVehicleNumberGetQuery();

    const fetchBusData = async (otp: string) => {
        setIsLoading(true);
        currentOtpRef.current = otp;
        const queryParams: publicTransportVehicleDataVehicleTypeVehicleNumberGetWithParams = {
            vehicleType: 'BUS',
            vehicleNumber: otp, // OTP is used as vehicleNumber
        };

        const result = await triggerPublicTransportVehicleDataVehicleTypeVehicleNumberGet(queryParams);

        setIsLoading(false);
        if (result.data) {
            setIsSuccess(true);
            logPrefixEvent(EventPrefix.NY_BUS_OTP_BOOK, 'success_' + otp);
            handleNavigateToTicketBookingFlow(result.data);
        } else {
            logPrefixEvent(EventPrefix.NY_BUS_OTP_BOOK, 'failure_' + otp);
            setIsWrongOtp(true);

            // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
            const errorPayload: any = result.error;

            if (result.error && errorPayload.data.errorCode === 'FLEET_ROUTE_MAP_MISSING') {
                setTimeout(() => {
                    busOtpSearchBottomSheetRef.current?.present();
                }, 0);
                // onFleetRouteMapMissing(currentOtpRef.current);
            } else if (result.error && errorPayload.data.errorCode === 'INVALID_VEHICLE_NUMBER') {
                onWrongOtp();
            } else if (result.error && errorPayload.data.errorCode === 'VEHICLE_DATA_MISSING') {
                onWrongOtp();
            } else {
                onError();
            }
            onCompleteCallback();
        }

        return result;
    };

    const handleNavigateToTicketBookingFlow = async (queryData: publicTransportData) => {
        if (currentOtpRef.current && queryData) {
            try {
                const routes = queryData.routes?.filter(
                    (route, index, self) => index === self.findIndex(t => t.code === route.code),
                );

                dispatch(
                    setBusOtpData({
                        otp: currentOtpRef.current,
                        payload: {
                            ...queryData,
                            routes: routes,
                            stations: getUniqueStations(queryData.stations),
                        },
                    }),
                );
                const { stations, routeStopMappings } = queryData;

                // Extract route shortName from the first route if available
                const detectedRoute = (routes && routes.length > 0 ? routes[0]?.shortName : null) ?? null;
                const detectedRouteCode = (routes && routes.length > 0 ? routes[0]?.code : null) ?? null;

                const sortedStations = sortStationsBySequence(stations, routeStopMappings, detectedRouteCode ?? null);
                const userLocationOverride = storedLoc ? { coords: storedLoc.coords } : undefined;
                const nearestStation = await findNearestStationForBusOtp(sortedStations, 100, 50, userLocationOverride);

                const filteredRouteSections = await computeFilteredRouteSections(
                    nearestStation?.code,
                    routes,
                    stations,
                    routeStopMappings,
                    userLocationOverride,
                );

                // Check for eligible passes
                // TODO: Remove manual override for testing
                const allowedOtps = ['j0859', 'j0860', 'j0861', 'j0862', 'j0863'];
                const manualEligiblePassIds = allowedOtps.includes(currentOtpRef.current?.toLowerCase() ?? '')
                    ? ['ulla-unlimited-1day']
                    : [];
                const finalEligiblePassIds = [...(queryData.eligiblePassIds || []), ...manualEligiblePassIds];

                dispatch(
                    setBusRouteData({
                        otp: currentOtpRef.current,
                        payload: {
                            sortedStations,
                            detectedRoute: detectedRoute || null,
                            nearestStation,
                            detectedRouteCode: detectedRouteCode || null,
                            detectedRouteObject: routes[0] ?? null,
                            enableSourceStopsSlicing: newFeatureFlags.enableSourceStopsSlicing,
                            filteredRouteSections,
                            eligiblePassIds: finalEligiblePassIds,
                        },
                    }),
                );

                console.info('Processed bus route data:', {
                    totalStations: sortedStations.length,
                    nearestStation: nearestStation?.name,
                    detectedRoute,
                });

                const hasEligiblePasses = finalEligiblePassIds.length > 0;
                console.info('Has eligible passes:', hasEligiblePasses);
                console.info('Final eligible passes:', finalEligiblePassIds);

                if (hasEligiblePasses) {
                    if (manualEligiblePassIds.length > 0) {
                        const cached = getCachedPurchasedPasses();

                        if (cached && cached.data) {
                            const pass = cached.data.find(pass => pass.passEntity.category.id == 'unlimited-ulla-pass');
                            if (pass && pass.status == 'Active') {
                                navigation.navigate('mainTabNavigation', {
                                    screen: 'passesTab_homeScreen',
                                });
                                return;
                            }
                        }

                        console.info('Eligible passes found, presenting pass selection bottom sheet');
                        // Present bottom sheet
                        setTimeout(() => {
                            touristBusPassBottomSheetRef.current?.present();
                        }, 0);
                    }
                } else {
                    console.info('No eligible passes, navigating to normal booking flow');
                    navigation.navigate('HomeTab', {
                        screen: 'busOTPViaTicketBookingFlow',
                        params: {
                            otp: currentOtpRef.current ?? '',
                            routeCode: undefined,
                            resetKey: undefined, // Forces new screen instance
                        },
                    });
                }
                onCompleteCallback();
            } catch (error) {
                console.error('Error processing bus route data:', error);
            }
        } else {
            console.error('No OTP or query data found');
        }
    };

    return useMemo(
        () => ({
            fetchBusData,
            error: queryError,
            isPublicTransportDataLoading: isLoading,
            isPublicTransportDataSuccess: querySuccess,
        }),
        [fetchBusData, queryError, isLoading, querySuccess],
    );
};
