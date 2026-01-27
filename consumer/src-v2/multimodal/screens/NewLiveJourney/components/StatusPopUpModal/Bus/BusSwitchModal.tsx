import { FRFSServiceTierType_fRFSServiceTierType } from '@/readOnly/api/types/Enums.gen';
import { BottomSheetModal, BottomSheetView, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import mtIcAcService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ac_service.webp';
import mtIcDeluxeService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_deluxe_service.webp';
import mtIcExpressService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_express_service.webp';
import mtIcOrdinaryService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';

import BusList, { BusItem } from '@/src-v2/multimodal/screens/SingleModeSearch/Components/BusList';
import DoubleChevronRight from '../../../../../../assets/svg/DoubleChevronRight';
import { Pressable } from '../../../../../../primitives/Pressable';
import { tailwind } from '../../../../../../tailwind-theme/tailwind';
import { Icon } from '../../../../../components/common/Icon';
import { BusIcon } from '../../../../../components/svg/transport';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface BaseProps {
    arrivalTime: Date;
    destination: string;
}

interface BusInfoAvailableProps extends BaseProps {
    type: 'busInfoAvailable';
    busNumber: string;
    busType: FRFSServiceTierType_fRFSServiceTierType;
    onSwitchBus: () => void;
    onGoBack: () => void;
}

interface BusInfoNotAvailableProps extends BaseProps {
    type: 'busInfoNotAvailable';
    busList: BusItem[];
}

type BusSwitchModalProps = BusInfoAvailableProps | BusInfoNotAvailableProps;

interface CountdownTimerProps {
    targetTime: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [remainingMinutes, setRemainingMinutes] = useState<number>(0);

    const targetTimeValue = useMemo(() => targetTime.getTime(), [targetTime]);

    useEffect(() => {
        const calculateRemainingTime = () => {
            const now = new Date();
            const diffInMs = targetTimeValue - now.getTime();
            const diffInMinutes = Math.max(0, Math.ceil(diffInMs / (1000 * 60)));
            return diffInMinutes;
        };

        const updateTimer = () => {
            setRemainingMinutes(calculateRemainingTime());
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [targetTimeValue]);

    return (
        <Animated.View style={tailwind.style('items-center justify-center pt-6 pb-7')}>
            <Animated.Text style={tailwind.style('text-[58px] font-departureMono-regular text-[#09941E]')}>
                {remainingMinutes}
            </Animated.Text>
            <Animated.Text
                style={tailwind.style(
                    'text-[25px] leading-[25px] font-departureMono-regular text-[#969696] uppercase text-center pt-2.5',
                )}>
                {userLanguageStrings.MIN}
            </Animated.Text>
        </Animated.View>
    );
};

export const BusSwitchModal: React.FC<BusSwitchModalProps> = props => {
    const { arrivalTime } = props;
    const { bottom } = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);
    useEffect(() => {
        sheetRef.current?.present();
    }, []);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <BottomSheetModal
            handleComponent={() => {
                return (
                    <Animated.View
                        style={[
                            tailwind.style(
                                'h-[75px] w-[75px] -mt-[37.5px] items-center justify-center z-[9999]',
                                `left-[${SCREEN_WIDTH / 2 - 37.5}px]`,
                            ),
                        ]}>
                        <Animated.View
                            style={tailwind.style(
                                'absolute inset-0 bg-[#FFE99E]  border-2 border-[#FFF7DD] opacity-10  rounded-full',
                            )}
                        />
                        <Animated.View
                            style={tailwind.style('h-9 w-9 bg-white items-center justify-center rounded-xl')}>
                            <Icon icon={<BusIcon />} size={22} />
                        </Animated.View>
                    </Animated.View>
                );
            }}
            style={tailwind.style('bg-white rounded-[36px]')}
            ref={sheetRef}
            enableDynamicSizing>
            <BottomSheetView style={tailwind.style(`pb-[${bottom}px]`)}>
                {props.type === 'busInfoAvailable' && (
                    <>
                        {props.busType === 'AC' && (
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="bus ac service image"
                                source={mtIcAcService}
                                style={[
                                    tailwind.style('absolute top-0 -right-5 w-[140px] h-[140px]'),
                                    { transform: [{ scaleX: -1 }] },
                                ]}
                            />
                        )}
                        {props.busType === 'EXECUTIVE' && (
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="bus deluxe service image"
                                source={mtIcDeluxeService}
                                style={[
                                    tailwind.style('absolute top-0 -right-5 w-[140px] h-[140px]'),
                                    { transform: [{ scaleX: -1 }] },
                                ]}
                            />
                        )}
                        {props.busType === 'EXPRESS' && (
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="bus express service image"
                                source={mtIcExpressService}
                                style={[
                                    tailwind.style('absolute top-0 -right-5 w-[140px] h-[140px]'),
                                    { transform: [{ scaleX: -1 }] },
                                ]}
                            />
                        )}
                        {props.busType === 'ORDINARY' && (
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="bus ordinary service image"
                                source={mtIcOrdinaryService}
                                style={[
                                    tailwind.style('absolute top-0 -right-5 w-[140px] h-[140px]'),
                                    { transform: [{ scaleX: -1 }] },
                                ]}
                            />
                        )}

                        <Animated.View>
                            <Animated.View style={tailwind.style('px-[28px] pt-[28px]')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[38px] leading-[41px] font-areaNormal-extrabold text-[#3B3A3C]',
                                    )}>
                                    {props.busNumber}
                                </Animated.Text>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[20px] leading-[23px] font-departureMono-regular text-[#7E7E7E] uppercase',
                                    )}>
                                    {props.busType}
                                </Animated.Text>
                            </Animated.View>
                            <Animated.View style={tailwind.style('px-[28px] pt-4')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[15px] leading-[22.5px] font-areaNormal-extrabold text-[#7E7E7E] max-w-2/3',
                                    )}>
                                    To {props.destination}
                                </Animated.Text>
                                <Animated.View style={tailwind.style('h-[1px] bg-[#D9D9D9] mt-5')}></Animated.View>

                                <Animated.View style={tailwind.style('justify-center items-center pt-[28px]')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[15px] leading-[22.5px] font-areaNormal-extrabold text-[#7E7E7E]',
                                        )}>
                                        {userLanguageStrings.ArrivesToTheAboveBusStopIn}
                                    </Animated.Text>
                                    <CountdownTimer targetTime={arrivalTime} />
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                        <Pressable
                            accessibilityLabel="Switch to Bus button"
                            accessibilityRole="button"
                            testID="switch-bus-button"
                            onPress={props.onSwitchBus}
                            style={tailwind.style('px-[28px] py-[16px]')}>
                            <Animated.View
                                style={tailwind.style(
                                    'flex-row items-center justify-center bg-[#016ACD] rounded-[16px] min-h-[58px]',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[15px] leading-[18px] font-areaNormal-extrabold text-white',
                                    )}>
                                    {userLanguageStrings.SwitchToBus(props.busNumber)}
                                </Animated.Text>
                                <Icon
                                    icon={<DoubleChevronRight fill="white" />}
                                    color="white"
                                    style={tailwind.style('ml-1')}
                                    size={16}
                                />
                            </Animated.View>
                        </Pressable>
                        <Pressable
                            accessibilityLabel="Go back button"
                            accessibilityRole="button"
                            testID="go-back-button"
                            onPress={props.onGoBack}
                            style={tailwind.style('px-[28px] pb-[16px]')}>
                            <Animated.View
                                style={tailwind.style(
                                    'flex-row items-center justify-center bg-[#FBFBFB] rounded-[16px] min-h-[58px]',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[15px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                    )}>
                                    {userLanguageStrings.GoBack}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </>
                )}
                {props.type === 'busInfoNotAvailable' && (
                    <Animated.View style={tailwind.style('py-[28px]')}>
                        <Animated.View style={tailwind.style('px-[28px]')}>
                            <Animated.View style={tailwind.style('justify-center items-center')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[15px] leading-[22.5px] font-areaNormal-extrabold text-[#7E7E7E]',
                                    )}>
                                    {userLanguageStrings.ABusIsArrivingInThisRouteIn}
                                </Animated.Text>
                                <CountdownTimer targetTime={arrivalTime} />
                            </Animated.View>
                        </Animated.View>
                        <Animated.View style={tailwind.style('px-[28px] pt-1.5')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[16px] font-areaNormal-extrabold leading-[25px] text-[#7E7E7E] text-center',
                                )}>
                                {userLanguageStrings.IfItGoesToYourDestinationPleaseVerifyAndCheckIn}
                            </Animated.Text>
                        </Animated.View>
                        <Pressable
                            accessibilityLabel="Got it button"
                            accessibilityRole="button"
                            testID="got-it"
                            onPress={() => {}}
                            style={tailwind.style('px-[28px] pb-[16px] pt-6')}>
                            <Animated.View
                                style={tailwind.style(
                                    'flex-row items-center justify-center bg-[#FBFBFB] rounded-[16px] min-h-[58px]',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[15px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                    )}>
                                    {userLanguageStrings.GotIt}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                        <Animated.View style={tailwind.style('px-[28px] justify-center items-center')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[13px] font-areaNormal-extrabold text-[#969696] pb-3 pt-5',
                                )}>
                                {userLanguageStrings.ThisTicketIsAlsoValidIn}
                            </Animated.Text>
                            <BusList
                                busList={props.busList}
                                isFilled={false}
                                isLoading={false}
                                showIcon={false}
                                isTicket={true}
                            />
                        </Animated.View>
                    </Animated.View>
                )}
            </BottomSheetView>
        </BottomSheetModal>
    );
};
