import { BusIcon, MetroIcon, TrainIcon } from '@/src-v2/multimodal/components/svg/transport';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Platform, Switch } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import CrossIcon from '../components/svg/CloseIcon';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { TogglesState, TransitDataValuesType, TransitTypes, TransportationTypes } from '../types';
import find from 'lodash/find';
import CombinationalRouteCard from './CombinationalRouteCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MultimodalTravelMode_multimodalTravelMode } from '../../../../../src/readOnly/api/types/Enums.gen';
import { useMultimodalUserPreferencesGetQuery } from '@/api/integrations/rtk/MultimodalUserPreferencesGet.ts';
import { useMultimodalUserPreferencesPostMutation } from '@/api/integrations/rtk/MultimodalUserPreferencesPost.ts';
import { transitValues } from '../constants';
import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
export type transitMode = 'combinational-route' | 'bus-route' | 'train-route' | 'metro-route';

const busRoutes = [
    {
        name: 'Ordinary',
        value: 'ordinary',
    },
    {
        name: 'Deluxe',
        value: 'deluxe',
    },
    {
        name: 'Express',
        value: 'express',
    },
    {
        name: 'AC',
        value: 'ac',
    },
];

export interface TransitItemProps {
    icon: ReactNode;
    title: string;
    description: string;
    bottomSection?: ReactNode;
    hasBorder?: boolean;
    rightIcon?: ReactNode;
    switchValue: boolean;
    name: TransitTypes;
    onSwitchChange?: (name: TransitItemProps['name'], value: TransitItemProps['switchValue']) => void;
}

/**
 * Utility function to get the value of a specific transit mode
 */
const getTransitValue = (editTransitValues: TransitDataValuesType[], transit: TransitTypes) => {
    return find(editTransitValues, item => transit === item?.transit);
};

const mapTransitModeToTransitType = (transitMode: transitMode): TransitTypes => {
    switch (transitMode) {
        case 'bus-route':
            return transitValues.bus;
        case 'train-route':
            return transitValues.train;
        case 'metro-route':
            return transitValues.metro;
        case 'combinational-route':
        default:
            return transitValues.combinational;
    }
};

export type EditTransitProps = {
    onClose: () => void;
    editTransitValues: TransitDataValuesType[];
    onTransitSwitchChange: (name: TransitDataValuesType['transit'], value: TransitDataValuesType['value']) => void;
    onBusRoutePress: (value: string[]) => void;
    onEditTransitConfirmPress: () => void;
    showBusRoutes: boolean | undefined;
    showTrainRoutes: boolean | undefined;
    showMetroRoutes: boolean | undefined;
    showCombinationalRoute: boolean | undefined;
    showToggle: boolean | undefined;
};

const ShimmerEffect = () => {
    const opacity = useSharedValue(0.3);
    const translateX = useSharedValue(0);

    useEffect(() => {
        opacity.value = withRepeat(withDelay(300, withTiming(0.8, { duration: 800 })), -1, true);
        translateX.value = withRepeat(withDelay(500, withTiming(5, { duration: 1200 })), -1, true);
    }, []);

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            backgroundColor: '#EAEAEA',
            width: 37,
            height: 20,
            borderRadius: 12,
            justifyContent: 'center',
            padding: 2,
        };
    });

    const circleStyle = useAnimatedStyle(() => {
        return {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)}>
            <Animated.View style={containerStyle}>
                <Animated.View style={circleStyle} />
            </Animated.View>
        </Animated.View>
    );
};

const EditTransit = ({
    onClose,
    editTransitValues,
    onTransitSwitchChange,
    showBusRoutes = true,
    showTrainRoutes = true,
    showMetroRoutes = true,
    onBusRoutePress = () => {},
    showCombinationalRoute = true,
    showToggle = true,
}: EditTransitProps) => {
    const { handlers: closeHandler, animatedStyle: closeAnimatedStyle } = useScaleAnimation();
    const { handlers: confirmHandler, animatedStyle: confirmAnimatedStyle } = useScaleAnimation();
    const { bottom } = useSafeAreaInsets();
    const [showShimmer, setShowShimmer] = React.useState(true);
    const didCompleteInitialization = useRef(false);
    const { data: userPreferences, isLoading } = useMultimodalUserPreferencesGetQuery({});
    const [updateUserPreferences, { isLoading: isUpdating }] = useMultimodalUserPreferencesPostMutation();

    const [toggles, setToggles] = useState<TogglesState>({
        busTransit: undefined,
        metroTransit: undefined,
        trainTransit: undefined,
    });

    useEffect(() => {
        setShowShimmer(true);
        return () => {
            didCompleteInitialization.current = false;
        };
    }, []);

    useEffect(() => {
        if (didCompleteInitialization.current || isLoading || !userPreferences?.allowedTransitModes) {
            return;
        }

        const allowedModes = userPreferences.allowedTransitModes;
        const hasBus = allowedModes.indexOf('Bus') >= 0;
        const hasTrain = allowedModes.indexOf('Subway') >= 0;
        const hasMetro = allowedModes.indexOf('Metro') >= 0;

        const updateToggles = {
            busTransit: hasBus,
            metroTransit: hasMetro,
            trainTransit: hasTrain,
        };

        setToggles(updateToggles);

        setTimeout(() => {
            if (getTransitValue(editTransitValues, 'bus-route')?.value !== hasBus) {
                onTransitSwitchChange('bus-route', hasBus);
            }

            if (getTransitValue(editTransitValues, 'train-route')?.value !== hasTrain) {
                onTransitSwitchChange('train-route', hasTrain);
            }

            if (getTransitValue(editTransitValues, 'metro-route')?.value !== hasMetro) {
                onTransitSwitchChange('metro-route', hasMetro);
            }

            didCompleteInitialization.current = true;

            setTimeout(() => {
                setShowShimmer(false);
            }, 300);
        }, 100);
    }, [userPreferences, isLoading]);

    const handleConfirmPress = async () => {
        const allowedTransitModes: MultimodalTravelMode_multimodalTravelMode[] = [
            toggles.busTransit ? 'Bus' : null,
            toggles.metroTransit ? 'Metro' : null,
            toggles.trainTransit ? 'Subway' : null,
        ].filter((transit): transit is MultimodalTravelMode_multimodalTravelMode => transit !== null);

        try {
            await updateUserPreferences({
                body: {
                    allowedTransitModes: allowedTransitModes,
                    journeyOptionsSortingType: userPreferences?.journeyOptionsSortingType || undefined,
                    busTransitTypes: userPreferences?.busTransitTypes ?? [],
                    subwayTransitTypes: userPreferences?.subwayTransitTypes ?? [],
                },
            });

            onClose();
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }
    };

    const [showWarning, setShowWarning] = React.useState(false);

    const transformFromTransitTypeToToggle = (transit: TransitDataValuesType['transit']) => {
        switch (transit) {
            case transitValues.bus:
                return 'busTransit';
            case transitValues.train:
                return 'trainTransit';
            case transitValues.metro:
                return 'metroTransit';
            default:
                return null;
        }
    };

    const onTransitToggleChange = (transit: TransitDataValuesType['transit'], value: boolean) => {
        const toggleKey = transformFromTransitTypeToToggle(transit);
        if (toggleKey) {
            setToggles(prev => ({ ...prev, [toggleKey]: value }));
        }
    };

    const handleTransitSwitchChange = (transit: TransitDataValuesType['transit'], value: boolean) => {
        // If trying to disable a toggle and it's the last one enabled, show warning
        if (!value) {
            const activeModes = Object.values(toggles).filter(Boolean).length;
            const toggleKey = transformFromTransitTypeToToggle(transit);
            if (toggleKey && activeModes <= 1 && toggles[toggleKey]) {
                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 3000);
                return;
            }
        }

        setShowWarning(false);
        onTransitToggleChange(transit, value);
    };

    const renderSwitch = (transitMode: transitMode) => {
        if (isLoading || showShimmer) {
            return <ShimmerEffect />;
        }

        const transitType = mapTransitModeToTransitType(transitMode);

        const transformFromTransitModeToToggle = (transitMode: transitMode) => {
            switch (transitMode) {
                case 'bus-route':
                    return 'busTransit';
                case 'train-route':
                    return 'trainTransit';
                case 'metro-route':
                    return 'metroTransit';
                default:
                    return null;
            }
        };

        const toggleKey = transformFromTransitModeToToggle(transitMode);
        const toggleValue = toggleKey ? toggles[toggleKey] : false;

        return (
            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)}>
                <Switch
                    trackColor={{ false: '#F0F1F4', true: '#4285F4' }}
                    thumbColor={'#FFFFFF'}
                    style={{
                        transform: [
                            { scaleX: Platform.OS === 'ios' ? 0.7 : 1 },
                            { scaleY: Platform.OS === 'ios' ? 0.7 : 1 },
                        ],
                    }}
                    // ios_backgroundColor="#3e3e3e"
                    onValueChange={val => handleTransitSwitchChange(transitType, val)}
                    value={toggleValue || false}
                />
            </Animated.View>
        );
    };

    // Generate transit modes based on active toggles
    const getActiveTransitModes = (): { mode: TransportationTypes; duration: number }[] => {
        return [
            toggles.busTransit && { mode: 'bus', duration: 10 },
            toggles.trainTransit && { mode: 'train', duration: 10 },
            toggles.metroTransit && { mode: 'metro', duration: 10 },
        ].filter((mode): mode is { mode: TransportationTypes; duration: number } => !!mode);
    };

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');

    return (
        <Animated.View style={tailwind.style(`px-4 h-full pb-[${bottom}px]`)}>
            {/* Header */}
            <Animated.View
                style={tailwind.style(
                    `flex-row items-center justify-between pb-[17px] border-b border-b-[${colors.CrossButton_bg}]`,
                )}>
                <Animated.Text
                    accessibilityLabel="Edit Transit"
                    style={tailwind.style('font-areaNormal-black text-[17px] text-[#8B8B8F] leading-[20px]')}>
                    {userLanguageStrings.EditTransit}
                </Animated.Text>
                <Pressable
                    onPress={onClose}
                    {...closeHandler}
                    testID="d8617371-04c0-4be2-a5c7-80e8814dabc2"
                    accessibilityRole="button"
                    accessibilityLabel="Close transit preferences button">
                    <Animated.View
                        style={[
                            tailwind.style(
                                `p-[10px] rounded-full bg-[${colors.CrossButton_bg}] flex-row items-center justify-center`,
                            ),
                            closeAnimatedStyle,
                        ]}>
                        <Icon icon={<CrossIcon />} size={16} />
                    </Animated.View>
                </Pressable>
            </Animated.View>

            {/* Combinational Route */}
            {showCombinationalRoute && (
                <Animated.View>
                    <Animated.Text
                        accessibilityLabel="Multi transit modes description"
                        style={tailwind.style('font-areaNormal-bold text-[13px] text-[#8B8B8F] mt-[20px]')}>
                        {userLanguageStrings.MultiTransitModesForBestRouteIncludingLastMileOptions}.
                    </Animated.Text>
                    <Animated.View style={tailwind.style('mt-[20px] mb-[12px]')}>
                        <CombinationalRouteCard transitModes={getActiveTransitModes()} />
                    </Animated.View>
                </Animated.View>
            )}

            {/* Individual Transit Items */}
            {showBusRoutes && (
                <Animated.View
                    style={tailwind.style(`py-[20px] border-b border-b-[${colors.CrossButton_bg}]`)}
                    layout={LinearTransition}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                        <Animated.View style={tailwind.style('flex-row items-center gap-[6px]')}>
                            <Icon icon={<BusIcon />} size={18} color="#585758" />
                            <Animated.Text
                                accessibilityLabel="Bus routes"
                                style={tailwind.style('font-areaNormal-extrabold text-[14px] text-[#353436]')}>
                                {userLanguageStrings.Busroutes}
                            </Animated.Text>
                        </Animated.View>
                        {showToggle && renderSwitch('bus-route')}
                    </Animated.View>
                    {/* TODO: Add back when we have the bus preferences */}
                    {getTransitValue(editTransitValues, transitValues.bus)?.value ? (
                        <Animated.View
                            style={tailwind.style('flex-row items-center pt-[20px] gap-[8px] flex-wrap')}
                            entering={FadeIn}
                            exiting={FadeOut}>
                            {busRoutes.map((item, index) => {
                                return (
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => {
                                            const busRoutes = getTransitValue(
                                                editTransitValues,
                                                transitValues.bus,
                                            )?.selectedBusRoutes;

                                            if (busRoutes?.includes(item.value)) {
                                                if (busRoutes.length !== 1) {
                                                    onBusRoutePress(busRoutes?.filter(route => route !== item.value));
                                                }
                                            } else {
                                                onBusRoutePress([...(busRoutes || []), item.value]);
                                            }
                                        }}
                                        key={item.value}
                                        testID={`49e433f3-db02-4a19-aee1-f8479a876010-${index}`}
                                        accessibilityLabel={`${item.name} bus route button`}>
                                        <Animated.View
                                            style={[
                                                tailwind.style(
                                                    'py-[12px] px-[24px] bg-[#FFFFFF] rounded-[16px] border',
                                                ),
                                                getTransitValue(
                                                    editTransitValues,
                                                    transitValues.bus,
                                                )?.selectedBusRoutes?.includes(item.value)
                                                    ? tailwind.style('border-[#EC4B47]')
                                                    : tailwind.style('border-[#FFFFFF]'),
                                            ]}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'font-areaNormal-black text-[12px] text-[#656565]',
                                                )}>
                                                {item.name}
                                            </Animated.Text>
                                        </Animated.View>
                                    </Pressable>
                                );
                            })}
                        </Animated.View>
                    ) : null}
                </Animated.View>
            )}

            {showTrainRoutes && (
                <Animated.View
                    style={tailwind.style(`py-[20px] border-b border-b-[${colors.CrossButton_bg}]`)}
                    layout={LinearTransition}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                        <Animated.View style={tailwind.style('flex-row items-center gap-[6px]')}>
                            <Icon icon={<TrainIcon />} size={18} color="#585758" />
                            <Animated.Text
                                accessibilityLabel="Train routes"
                                style={tailwind.style('font-areaNormal-extrabold text-[14px] text-[#353436]')}>
                                {userLanguageStrings.Trainroutes}
                            </Animated.Text>
                        </Animated.View>
                        {showToggle && renderSwitch('train-route')}
                    </Animated.View>
                </Animated.View>
            )}

            {showMetroRoutes && (
                <Animated.View
                    style={tailwind.style(`py-[20px] border-b border-b-[${colors.CrossButton_bg}]`)}
                    layout={LinearTransition}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                        <Animated.View style={tailwind.style('flex-row items-center gap-[6px]')}>
                            <Icon icon={<MetroIcon />} size={18} color="#585758" />
                            <Animated.Text
                                accessibilityLabel="Metro routes"
                                style={tailwind.style('font-areaNormal-extrabold text-[14px] text-[#353436]')}>
                                {userLanguageStrings.Metroroutes}
                            </Animated.Text>
                        </Animated.View>
                        {showToggle && renderSwitch('metro-route')}
                    </Animated.View>
                </Animated.View>
            )}

            {/* Display warning only when user tries to deselect the last enabled option */}
            {showWarning ? (
                <Animated.View
                    layout={LinearTransition}
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={tailwind.style(
                        'mt-[22px] py-[10px] bg-white rounded-[14px] flex-row justify-center gap-[7px] items-center',
                    )}>
                    <Icon icon={<InfoIcon />} />
                    <Animated.Text
                        accessibilityLabel="Warning: Please keep at least one transit selected"
                        style={tailwind.style('text-[#656565] font-areaNormal-semibold text-[13px] ')}>
                        {userLanguageStrings.Pleasekeepatleastonetransitselected}
                    </Animated.Text>
                </Animated.View>
            ) : null}

            <Pressable
                {...confirmHandler}
                style={tailwind.style('mt-auto')}
                onPress={handleConfirmPress}
                disabled={isLoading || isUpdating}
                testID="eef272f0-e075-4341-ae3a-c42872d82239"
                accessibilityRole="button"
                accessibilityLabel={
                    isUpdating
                        ? 'Updating transit preferences'
                        : isLoading
                          ? 'Loading transit preferences'
                          : 'Confirm transit preferences'
                }>
                <Animated.View
                    style={[
                        tailwind.style(
                            'bg-[#F74940] rounded-[12px] py-[18px] w-full flex-row items-center justify-center',
                        ),
                        confirmAnimatedStyle,
                        (isLoading || isUpdating) && tailwind.style('opacity-70'),
                    ]}>
                    <Animated.Text style={tailwind.style('font-areaNormal-black text-[16px] text-[#FFFFFF]')}>
                        {isUpdating
                            ? userLanguageStrings.Updating
                            : isLoading
                              ? userLanguageStrings.Loading
                              : userLanguageStrings.Confirm}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export default EditTransit;
