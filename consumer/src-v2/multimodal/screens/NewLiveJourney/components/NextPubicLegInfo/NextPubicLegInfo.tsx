import { View } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Button from '@/src-v2/primitives/Button';
import Animated from 'react-native-reanimated';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import SwitchPublicLegToast, { SwitchPublicLegProps } from '@/src-v2/multimodal/components/SwitchPublicLegToast';
import { colors } from 'config-types/dist/domain/default/themes/colors';
import LoadingSpinner from '@/src-v2/multimodal/screens/NewLiveJourney/assets/svg/LoadingSpinner';
import { Icon } from '@/typescript/components/Icon';
import busImage from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import trainImage from '@/src-v2/assets/3D-assets/review-transits/mt_ic_train_transit_review.webp';
import metroImage from '@/src-v2/assets/3D-assets/mt_ic_metro_live_tracking.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type NextPubicLegInfoProps = {
    travelMode: MultimodalTravelMode_multimodalTravelMode;
    origin: string;
    destination: string;
    arrivalTime: string | undefined;
    vehicleInfo: string | null;
    switchLegProps: SwitchPublicLegProps | undefined;
    busState: 'onTime' | 'missed';
    trainOrMetroState: 'scheduled' | 'arriving';
    onTrackPress: (() => void) | undefined;
    onSwitchPress: () => void;
    onTimetablePress: () => void;
    isLoading: boolean;
    isTrackAvailableForBus: boolean | undefined;
};

export const NextPubicLegInfo = (props: NextPubicLegInfoProps) => {
    const {
        travelMode,
        origin,
        destination,
        switchLegProps,
        arrivalTime,
        vehicleInfo,
        busState,
        trainOrMetroState,
        onTrackPress,
        onSwitchPress,
        onTimetablePress,
        isLoading,
        isTrackAvailableForBus,
    } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    if (switchLegProps) {
        return <SwitchPublicLegToast {...switchLegProps} />;
    }

    const renderBusContent = () => {
        if (isLoading) {
            return (
                <>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="bus image"
                        source={busImage}
                        style={tailwind.style('w-[70px] h-[90px] -ml-[10px]')}
                        resizeMode="contain"
                    />
                    <Animated.Text
                        style={tailwind.style(
                            `text-[13px] leading-[19.5px] font-areaNormal-extrabold text-[${colors.gray900}] mr-[10px] flex-1 tracking-[0.2px] pr-[15px]`,
                        )}
                        numberOfLines={2}>
                        {userLanguageStrings.SwitchingToTheNextBus(vehicleInfo)}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('pr-[16px]')}>
                        <Icon icon={<LoadingSpinner />} size={22} />
                    </Animated.View>
                </>
            );
        }
        switch (busState) {
            case 'onTime':
                return (
                    <>
                        <Animated.Image
                            accessible={false}
                            source={busImage}
                            style={tailwind.style('w-[70px] h-[90px] -ml-[10px]')}
                            resizeMode="contain"
                        />
                        <Animated.Text
                            style={tailwind.style(
                                `text-[13px] leading-[19.5px] font-areaNormal-extrabold pl-2 text-[${colors.gray900}] flex-1 tracking-[0.2px]`,
                            )}
                            numberOfLines={2}>
                            {userLanguageStrings.BusIsOnTimeTo(vehicleInfo, destination)}
                        </Animated.Text>
                        <Button
                            testID="track-bus-button"
                            type="primary"
                            text={isTrackAvailableForBus ? userLanguageStrings.Track : userLanguageStrings.Timetable}
                            onPress={isTrackAvailableForBus ? onTrackPress : onTimetablePress}
                            isLoading={isLoading}
                            size="md"
                            style={tailwind.style(
                                `ml-[10px] min-w-[90px] h-[32px] mr-[16px] rounded-[20px] items-center justify-center`,
                            )}
                            textStyle={tailwind.style(
                                `text-[13px] leading-[16px] font-areaNormal-extrabold pr-[12px] pl-[12px]`,
                            )}
                        />
                    </>
                );
            case 'missed':
                return (
                    <>
                        <Animated.Image
                            accessible={false}
                            source={busImage}
                            style={tailwind.style('w-[70px] h-[90px] -ml-[10px]')}
                            resizeMode="contain"
                        />
                        <Animated.Text
                            style={tailwind.style(
                                `text-[13px] leading-[19.5px] font-areaNormal-extrabold  pl-1 text-[${colors.gray900}] flex-1 tracking-[0.2px]`,
                            )}
                            numberOfLines={2}>
                            {userLanguageStrings.YouMightMissBusSwitchToNextBus(vehicleInfo)}
                        </Animated.Text>
                        <Button
                            testID="switch-bus-button"
                            type="primary"
                            text={userLanguageStrings.Switch}
                            onPress={onSwitchPress}
                            isLoading={isLoading}
                            size="md"
                            style={tailwind.style(
                                `ml-[10px] min-w-[90px] h-[32px] mr-[16px] rounded-[20px] items-center justify-center`,
                            )}
                            textStyle={tailwind.style(
                                `text-[13px] leading-[16px] font-areaNormal-extrabold pr-[12px] pl-[12px]`,
                            )}
                        />
                    </>
                );
            default:
                return null;
        }
    };

    const renderTrainOrMetroContent = () => {
        switch (trainOrMetroState) {
            case 'scheduled':
                return (
                    <>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel={
                                travelMode === 'Metro' ? 'metro scheduled indicator' : 'train scheduled indicator'
                            }
                            source={travelMode === 'Metro' ? metroImage : trainImage}
                            style={
                                travelMode === 'Metro'
                                    ? tailwind.style('w-[90px] h-[90px] -ml-[25px]')
                                    : tailwind.style('w-[90px] h-[90px] -ml-[10px] -mt-[20px]')
                            }
                            resizeMode="contain"
                        />
                        <Animated.Text
                            style={tailwind.style(
                                `text-[13px] leading-[19.5px] font-areaNormal-extrabold ${travelMode === 'Subway' ? '-ml-[20px]' : 'pl-1'} text-[${colors.gray900}] flex-1 tracking-[0.2px]`,
                            )}
                            numberOfLines={2}>
                            {userLanguageStrings.TransitScheduledToArriveAt(
                                travelMode === 'Metro' ? userLanguageStrings.Metro : userLanguageStrings.Train,
                                arrivalTime,
                            )}
                        </Animated.Text>
                        <Button
                            testID="train-timetable-button"
                            type="primary"
                            text={userLanguageStrings.Timetable}
                            onPress={onTimetablePress}
                            isLoading={isLoading}
                            size="md"
                            style={tailwind.style(
                                `ml-[10px] min-w-[90px] h-[32px] mr-[16px] rounded-[20px] items-center justify-center`,
                            )}
                            textStyle={tailwind.style(
                                `text-[13px] leading-[16px] font-areaNormal-extrabold pr-[12px] pl-[12px]`,
                            )}
                        />
                    </>
                );
            case 'arriving':
                return (
                    <>
                        <Animated.Image
                            accessible={false}
                            source={travelMode === 'Metro' ? metroImage : trainImage}
                            style={
                                travelMode === 'Metro'
                                    ? tailwind.style('w-[90px] h-[90px] -ml-[25px]')
                                    : tailwind.style('w-[90px] h-[90px] -ml-[10px] -mt-[20px]')
                            }
                            resizeMode="contain"
                        />
                        <Animated.Text
                            style={tailwind.style(
                                `text-[13px] leading-[19.5px] font-areaNormal-extrabold  ${travelMode === 'Subway' ? '-ml-[20px]' : 'pl-1'} text-[${colors.gray900}] flex-1 tracking-[0.2px]`,
                            )}
                            numberOfLines={2}>
                            {travelMode === 'Metro' ? userLanguageStrings.Metro : userLanguageStrings.Train}{' '}
                            {userLanguageStrings.ArrivesAt} {origin}
                        </Animated.Text>
                        <Animated.Text style={tailwind.style('text-2xl text-gray-900 pr-4 font-departureMono-regular')}>
                            {arrivalTime}
                        </Animated.Text>
                    </>
                );
            default:
                return null;
        }
    };

    const renderContent = () => {
        if (travelMode === 'Bus') {
            return renderBusContent();
        }
        if (travelMode === 'Subway' || travelMode === 'Metro') {
            return renderTrainOrMetroContent();
        }
        return null;
    };

    return (
        <View
            style={tailwind.style(
                `flex-row items-center bg-[#F7F7F7] border border-[${colors.white200}] h-[64px] rounded-[15px] overflow-hidden mx-6 my-2`,
                busState === 'missed' ? 'bg-[#FFE688]' : 'bg-[#F7F7F7]',
            )}>
            <View style={tailwind.style('flex-1 flex-row items-center')}>{renderContent()}</View>
        </View>
    );
};
