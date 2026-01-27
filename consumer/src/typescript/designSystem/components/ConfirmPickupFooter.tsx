import React, { useContext, useEffect } from 'react';
import colors from '../../designSystem/colorPalette';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Button from '@/src-v2/primitives/Button';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    BottomSheetStage,
    SearchInput,
    selectSearchedStops,
    selectIsPickup,
    selectSearchedSource,
    selectSourceSetUsingPin,
    setActiveInput,
    setBottomSheetStage,
    setIsPickup,
    setSourceSetUsingPin,
    selectDestination,
    selectFareProductType,
    selectAppConfig,
} from '@/typescript/state/client/session';

import { EventName, logEvent } from '@/typescript/utils/logger';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MapContext } from '@/typescript/Maps/MapContext';
import { logger } from '@/src-v2/systems/logger';
import { useCheckForInterCity } from '@/typescript/hooks/checkForIntercity';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { emptyJourneyDetailsProps } from '@/src-v2/multimodal/screens/JourneyInfoScreen';

export const ConfirmPickupFooter = () => {
    const configManager = useConfigContext();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const source = useAppSelector(selectSearchedSource);
    const stops = useAppSelector(selectSearchedStops);
    const isPickup = useAppSelector(selectIsPickup);
    const sourceSetUsingPin = useAppSelector(selectSourceSetUsingPin);
    const { mapRef } = useContext(MapContext);
    const dispatch = useAppDispatch();
    const destination = useAppSelector(selectDestination);
    const fareProductType = useAppSelector(selectFareProductType);
    const { bottom } = useSafeAreaInsets();
    const { isInterCity } = useCheckForInterCity(source, [destination ?? null]);
    const appConfig = useAppSelector(selectAppConfig);

    const handleLocationPickupOnPress = (): void => {
        logEvent(EventName.NY_USER_CONFIRM_PICKUP);

        if (isPickup) {
            dispatch(setSourceSetUsingPin(true));

            // Check if we have at least one stop and all non-null stops are serviceable
            const stopsValid =
                stops.some(stop => stop !== null) && stops.every(stop => stop === null || stop.serviceable);

            if ((stopsValid || fareProductType === 'RENTAL') && source?.serviceable) {
                if (isInterCity) {
                    logEvent(EventName.NY_USER_PICKUP_SELECT, { Source: source });
                    dispatch(
                        setBottomSheetStage({ stage: BottomSheetStage.IntercitySearchDetails, src: 'cpf_intercity' }),
                    );
                } else {
                    logEvent(EventName.NY_USER_PICKUP_SELECT, { Source: source });
                    if (appConfig.appType === 'multimodal') {
                        navigation.navigate('ServicesTab', {
                            screen: 'singleModeBookingNavigator',
                            params: {
                                screen: 'journeyDetails',
                                params: emptyJourneyDetailsProps,
                            },
                        });
                    } else dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'cpf_else' }));
                }
            } else if (source && !source.serviceable) {
                logger.logDebug(`Source not serviceable -> ${source}`, 'SearchFlow');
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'cpf_srcNotServiceable' }));
            } else {
                dispatch(setActiveInput(SearchInput.Destination));
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'cpf_no_serviceable_stops' }));
            }
        } else {
            dispatch(setIsPickup(true));

            const hasAtLeastOneStop = stops.some(stop => stop !== null);
            const allStopsServiceable = stops.every(stop => !stop || stop.serviceable);

            if (sourceSetUsingPin && source?.serviceable && hasAtLeastOneStop && allStopsServiceable) {
                if (isInterCity) {
                    logEvent(EventName.NY_USER_PICKUP_SELECT, { Source: source.title });
                    dispatch(
                        setBottomSheetStage({
                            stage: BottomSheetStage.IntercitySearchDetails,
                            src: 'cpf_intercity_dest',
                        }),
                    );
                } else {
                    logEvent(EventName.NY_USER_PICKUP_SELECT, { Source: source.title });
                    if (appConfig.appType === 'multimodal') {
                        navigation.navigate('ServicesTab', {
                            screen: 'singleModeBookingNavigator',
                            params: {
                                screen: 'journeyDetails',
                                params: emptyJourneyDetailsProps,
                            },
                        });
                    } else dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'cpf_else_dest' }));
                }
            } else {
                if (!stops.every(stop => stop && stop.serviceable)) {
                    dispatch(setActiveInput(SearchInput.Destination));
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'cpf_else_dest2' }));
                }
            }
        }
        mapRef.current?.removeAllZone();
    };

    useEffect(() => {
        logEvent(EventName.NY_USER_DESTINATION_SELECT, { Destination: destination?.title });
    }, [destination]);

    return (
        <Animated.View
            style={[
                tailwind.style(
                    `pt-[${token?.spacing?.[2]}] w-full absolute bottom-0 pb-[${bottom || 12}px] px-[${
                        token?.spacing?.[16]
                    }] bg-[${themeColors.Fill_neutralUltraLow}]`,
                ),
                styles.confirmPickupFooter,
            ]}>
            <Button
                testID="b6f35ee5-d687-445d-8b40-150577f7cc3a"
                type="primary"
                showLoader={true}
                text={userLanguageStrings.ConfirmLocation}
                textColor={themeColors.Button_Primary_Default_Text_Base}
                style={[styles.button, { backgroundColor: themeColors.Button_primary_default_fill_base }]}
                onPress={() => {
                    logEvent(EventName.NY_USER_CONFIRM_PICKUP);
                    handleLocationPickupOnPress();
                }}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    confirmPickupFooter: {
        shadowColor: '' + `${colors?.recovered?.neutralMax}` + '1F',
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
    button: {
        justifyContent: 'center',
    },
});
