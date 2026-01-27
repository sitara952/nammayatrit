import React, { useCallback, useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useRefsContext } from '../context/RefsContext';
import Button from '@/src-v2/primitives/Button';
import Typography from '../designSystem/components/primitives/Typography';
import token from '../designSystem/tokens';
import { Icon } from '../components/Icon';
import Danger from '../components/svg/Danger';
import BadCar from '../components/svg/BadCar';
import Clock from '../components/svg/Clock';
import PickupLocation from '../components/svg/PickupLocation';
import WrongLocationIcon from '../assets/svg/symbols/WrongLocationIcon';
import AnotherCar from '../components/svg/AnotherCar';
import Snowflake from '../components/svg/Snowflake';
import Dislike from '../components/svg/Dislike';
import colors from '../designSystem/colorPalette';
import DriverCharginExtra from '../components/svg/DriverCharginExtra';
import { setIsAddTipSelected, setCustomerTip } from '@/typescript/state/client/search';
import { setPersistedTipOptions, setPersistedSmartTipValue } from '@/typescript/state/client/search';

type CancellationBox = {
    text: string;
    icon: React.ElementType;
    selected: boolean;
    code: string;
};
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { BookingId, selectSearchId } from '../state/client/user';
import {
    selectRideDetailsWithId,
    selectInitialDriverETAWithId,
    selectInitialPickupDistanceWithId,
} from '../state/client/ride';
import { useCancelBookingMutation } from '../state/server/bookingApi';
import { setToastProps, selectOperatingCity } from '../state/client/session';
import { EventName, logEvent } from '../utils/logger';
import {
    selectBookedSourceWithId,
    selectBookingDetailsWithId,
    selectRideIdWithBookingId,
} from '../state/client/booking';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { TextInput } from 'react-native-gesture-handler';
import { configManager } from '@/src-v2/systems/configs/configManager';
import { CancellationReasonConfig, DynamicCancellationTranslationKey } from '@/src-v2/systems/configs/types';
import { MultimodalTaxiTrackingProps } from '../navigation/globalParamList';
import { setLegIsLoading } from '../state/client/journey';

type CancellationReasonProps = {
    onRideConfirmedCancel: (() => void) | undefined;
    bookingId: BookingId | null | undefined;
    setShowCancellationReasonModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTripDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
    imageKey: string | undefined;
};

const iconMapping: Record<string, React.ElementType> = {
    Clock,
    BadCar,
    PickupLocation,
    WrongLocationIcon,
    AnotherCar,
    Snowflake,
    Dislike,
    DriverCharginExtra,
};

const CancellationReason = ({
    onRideConfirmedCancel = () => {},
    bookingId = null,
    setShowCancellationReasonModal,
    setShowTripDetailsModal,
    multimodalProps,
    imageKey,
}: CancellationReasonProps) => {
    const configContext = useConfigContext();
    const themeColors = configContext.get('themeColors');
    const userLanguageStrings = configContext.get('userLanguageStrings');
    const operatingCity = useAppSelector(selectOperatingCity);
    const { cancellationReasonBottomsheetModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const source = useAppSelector(state => selectBookedSourceWithId(state, bookingId));
    const initialDriverETA = useAppSelector(state => selectInitialDriverETAWithId(state, rideId));
    const initialPickupDistance = useAppSelector(state => selectInitialPickupDistanceWithId(state, rideId));
    const dispatch = useAppDispatch();
    const [loadingCancelBooking, setLoadingCancelBooking] = useState(false);
    const isAirConditioned = bookingDetails?.isAirConditioned === true;
    const searchId = useAppSelector(state => selectSearchId(state, null));

    const dynamicReasons = configManager.getFilteredDynamicCancellationReasons(operatingCity);

    const getTranslationText = (key: DynamicCancellationTranslationKey): string => {
        switch (key) {
            case DynamicCancellationTranslationKey.DRIVER_DEMANDED_EXTRA:
                return userLanguageStrings.DriverDemandedExtra;
            case DynamicCancellationTranslationKey.DRIVER_DENIED_DUTY:
                return userLanguageStrings.DriverDeniedDuty;
            default:
                return 'Unknown reason';
        }
    };
    const baseReasonList: Array<CancellationBox> = [
        {
            text: userLanguageStrings.Waittimetoolong,
            icon: Clock,
            selected: false,
            code: 'WAIT_TIME_TOO_LONG',
        },
        {
            text: userLanguageStrings.Gotanotherrideelsewhere,
            icon: AnotherCar,
            selected: false,
            code: 'GOT_ANOTHER_RIDE',
        },
        rideDetails
            ? {
                  text: userLanguageStrings.Wrongpickuplocation,
                  icon: PickupLocation,
                  selected: false,
                  code: 'WRONG_PICKUP_LOCATION',
              }
            : {
                  text: userLanguageStrings.Wrongpickuppoint,
                  icon: WrongLocationIcon,
                  selected: false,
                  code: 'WRONG_PICKUP_LOCATION',
              },
        rideDetails
            ? {
                  text: userLanguageStrings.Drivernotmoving,
                  icon: BadCar,
                  selected: false,
                  code: 'DRIVER_NOT_MOVING',
              }
            : {
                  text: userLanguageStrings.Driverunavailable,
                  icon: BadCar,
                  selected: false,
                  code: 'DRIVER_UNAVAILABLE',
              },
    ];

    const dynamicReasonsList: Array<CancellationBox> = dynamicReasons.map((reason: CancellationReasonConfig) => {
        const displayText: string = getTranslationText(reason.translationKey);

        return {
            text: displayText,
            icon: iconMapping[reason.icon] || Dislike,
            selected: false,
            code: reason.code,
        };
    });

    const reasonList: Array<CancellationBox> = [
        ...baseReasonList,
        ...dynamicReasonsList,
        ...(rideDetails && isAirConditioned
            ? [
                  {
                      text: userLanguageStrings.ACNotturnedON,
                      icon: Snowflake,
                      selected: false,
                      code: 'AC_NOT_TURNED_ON',
                  },
                  {
                      text: userLanguageStrings.Myissueisnotlistedhere,
                      icon: Dislike,
                      selected: false,
                      code: 'OTHER',
                  },
              ]
            : [
                  {
                      text: userLanguageStrings.Myissueisnotlistedhere,
                      icon: Dislike,
                      selected: false,
                      code: 'OTHER',
                  },
              ]),
    ];

    const [reasonListVal, setReasonList] = useState(reasonList);
    const [otherReason, setOtherReason] = useState('');

    const [selectedReasonCode, setSelectedReasonCode] = useState<string | null>(null);
    const [selectedVal, setSelectedVal] = useState<CancellationBox | undefined>(undefined);
    const updateReasonList = (index: number) => {
        const updatedReasonList = reasonListVal.map((reason, i) => ({
            ...reason,
            selected: i === index,
        }));

        setReasonList(updatedReasonList);
        updatedReasonList[index] && setSelectedReasonCode(updatedReasonList[index].code);
    };

    useEffect(() => {
        const selectedVal = reasonListVal.find(val => val.selected);
        setSelectedVal(selectedVal);
    }, [reasonListVal]);

    const [cancelBooking] = useCancelBookingMutation();

    const handleCancelBooking = useCallback(() => {
        setLoadingCancelBooking(true);

        const cancelBookingReq = {
            bookingId,
            data: {
                additionalInfo: selectedVal?.code === 'OTHER' ? otherReason : selectedVal?.text,
                reasonCode: selectedVal?.code,
                reasonStage: 'OnAssign',
                reallocate: false,
            },
        };

        cancelBooking(cancelBookingReq)
            .unwrap()
            .then(() => {
                logEvent(EventName.NY_USER_RIDE_CANCELLED_BY_USER, {
                    imageKey: imageKey,
                    PickupETA: initialDriverETA,
                    PickupDistance: initialPickupDistance,
                    RideId: rideId,
                    VehicleVariant: rideDetails?.vehicleVariant,
                    CancellationFee: rideDetails?.cancellationFeeIfCancelled,
                });
                logEvent(EventName.NY_USER_CANCELLATION_REASON, {
                    'Reason code': selectedVal?.code,
                    RideId: rideId,
                    VehicleVariant: rideDetails?.vehicleVariant,
                });
                logEvent(EventName.NY_USER_RIDER_CANCELLATION, {
                    'Reason code': selectedVal?.code,
                    'Additional info': selectedVal?.code === 'OTHER' ? otherReason : selectedVal?.text,
                    Pickup: source,
                    'Estimated Ride Distance': bookingDetails?.estimatedDistance,
                    RideId: rideId,
                    VehicleVariant: rideDetails?.vehicleVariant,
                });
                // cancellationReasonBottomsheetModalRef?.current?.dismiss();
                setShowTripDetailsModal(false);
                setShowCancellationReasonModal(false);
                onRideConfirmedCancel();
                setLoadingCancelBooking(false);
                dispatch(setCustomerTip({ id: searchId, payload: undefined }));
                dispatch(setPersistedTipOptions({ id: searchId, payload: null }));
                dispatch(setPersistedSmartTipValue({ id: searchId, payload: null }));
                dispatch(setIsAddTipSelected({ id: searchId, payload: false }));
                if (multimodalProps) {
                    dispatch(
                        setLegIsLoading({
                            id: multimodalProps.journeyId,
                            payload: { legOrder: multimodalProps.currentLegOrder, journeyRefresh: true },
                        }),
                    );
                }
            })
            .catch(error => {
                dispatch(
                    setToastProps({
                        visible: true,
                        message: userLanguageStrings.RidecancellationfailednPleaseretry,
                        backgroundColor: `${themeColors.Fill_negativeHigh}`,
                        autoDismissAfter: 2100,
                        logo: <Danger />,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
                console.error('cancel ride error', error);
                setLoadingCancelBooking(false);
            });
    }, [
        bookingId,
        bookingDetails?.estimatedDistance,
        cancelBooking,
        cancellationReasonBottomsheetModalRef,
        dispatch,
        onRideConfirmedCancel,
        otherReason,
        selectedVal?.code,
        selectedVal?.text,
        source,
        searchId,
    ]);

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] pt-[29px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
            )}>
            <Animated.View style={tailwind.style(`pb-${token?.spacing?.[20]}`)}>
                <Animated.View style={tailwind.style('flex-row items-center justify-start')}>
                    <Typography
                        style={tailwind.style('text-lg font-extrabold leading-6 text-[18px]')}
                        type="subhead-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={'header'}>
                        {userLanguageStrings.Letusknowthereasonforcancellation}
                    </Typography>
                </Animated.View>
            </Animated.View>

            {selectedVal?.code === 'OTHER' ? (
                <Animated.View>
                    <Typography
                        style={tailwind.style('font-extrabold leading-6 text-[12rpx]')}
                        type="subhead-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Pleaseelaborateonyourissue}
                    </Typography>

                    <TextInput
                        accessibilityLabel="Text input field"
                        placeholder={undefined}
                        style={tailwind.style('px-2 bg-white h-[54px] border border-[#E0E3E8] rounded-lg	')}
                        autoFocus={true}
                        onChangeText={text => {
                            setOtherReason(text);
                        }}
                    />
                </Animated.View>
            ) : (
                reasonListVal.map((val, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            tailwind.style(
                                val.selected ? 'bg-black' : 'bg-white',
                                'rounded-3xl flex flex-row border border-[#E0E3E8] my-1',
                            ),
                            { alignSelf: 'flex-start', flexShrink: 1 },
                        ]}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityState={{ selected: val.selected }}
                            accessibilityLabel={`${val.text}${val.selected ? ', selected' : ''}`}
                            testID={`cancellation_reason_${val.code}`}
                            style={[
                                tailwind.style('px-2 flex-row pb-2 items-center'),
                                { alignSelf: 'flex-start', flexShrink: 1 },
                            ]}
                            onPress={() => updateReasonList(index)}>
                            <Animated.View style={tailwind.style('px-2 h-[40px] items-center justify-center shrink')}>
                                <Icon icon={<val.icon color={val.selected ? '#ffffff' : '#14171F'} />} size={12} />
                            </Animated.View>
                            <Typography
                                style={[
                                    tailwind.style(
                                        'text-sm px-2 items-center pt-2 justify-center',
                                        val.selected ? 'text-white' : 'text-black',
                                    ),
                                    { alignSelf: 'center', flexShrink: 1 },
                                ]}
                                type="subhead-1"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {val.text}
                            </Typography>
                        </TouchableOpacity>
                    </Animated.View>
                ))
            )}

            <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[16]}]`)}>
                <Button
                    testID="cancellation_reason_submit"
                    type="primary"
                    text={userLanguageStrings.Submit}
                    disabled={!selectedReasonCode}
                    isLoading={loadingCancelBooking}
                    onPress={handleCancelBooking}
                />
                <Animated.View style={tailwind.style(`pt-2`)}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={'Go Back button'}
                        testID="cancellation_reason_go_back"
                        onPress={() => {
                            if (selectedReasonCode == 'OTHER') {
                                setSelectedVal(undefined);
                                setReasonList(reasonList);
                            } else {
                                // cancellationReasonBottomsheetModalRef?.current?.close();
                                setShowCancellationReasonModal(false);
                                setShowTripDetailsModal(false);
                            }
                        }}>
                        <Animated.View
                            style={tailwind.style(
                                `w-full items-center justify-center bg-[${colors.primitive.gray[16]}] rounded-xl mt-2 py-3`,
                            )}>
                            <Typography
                                style={tailwind.style('text-[#5B6777] text-center')}
                                type="subhead-1"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.GoBack}
                            </Typography>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default CancellationReason;
