import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Dimensions, Image, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import mtIcBusSideView from '../../../../assets/3D-assets/mt_ic_bus_side_view.webp';
import mtIcMetroSideView from '../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import mtIcTrainSideView from '../../../../assets/3D-assets/mt_ic_train_side_view.webp';
import mtIcGradientMask from '../../../../assets/mt_ic_gradient_mask.webp';
import mtIcJourneyCompleteBgText from '../../../../assets/mt_ic_journey_complete_bg_text.webp';
import mtIcWavyBg from '../../../../assets/mt_ic_wavy_bg.webp';
import { getIconFromType } from '../../../components/PublicTransportCard/PublicTransportCardUtils';
import { Icon } from '../../../components/common/Icon';
import { MetroIcon } from '../../../components/svg/transport';
import { StaticJourneyHighlightCardProps } from '../types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
const { width, height } = Dimensions.get('window');

export function FullScreenRadialGradient() {
    return (
        <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
                <RadialGradient id="grad" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#ECE6EE" stopOpacity={1} />
                    <Stop offset="24%" stopColor="#ECEAE2" stopOpacity={1} />
                    <Stop offset="48%" stopColor="#F0EAF2" stopOpacity={1} />
                    <Stop offset="75%" stopColor="#F6FFFE" stopOpacity={1} />
                    <Stop offset="100%" stopColor="#DBE8ED" stopOpacity={1} />
                </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" fillOpacity={0.95} />
        </Svg>
    );
}

export const StaticJourneyHighlightCard = ({
    mode,
    timeSaved,
    costSaved,
    journeyModes,
    isFallback,
}: StaticJourneyHighlightCardProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const appConfig = useAppSelector(selectAppConfig);

    // Same logic as before for text values
    const showMaxValueEitherTimeOrCost = timeSaved > 10 ? `${timeSaved}` : costSaved > 10 ? `₹${costSaved}` : timeSaved;

    const showMaxValueEitherTimeOrCostTitleText =
        timeSaved > 10 ? `I have earned` : costSaved > 10 ? `I have saved` : `I have earned`;

    const showMaxValueEitherTimeOrCostSubtitleText =
        timeSaved > 10 ? `more time using` : costSaved > 10 ? `on my trip using` : `more time using`;

    return (
        <View style={tailwind.style('flex-1 items-center justify-center bg-[#1E1E1E]')}>
            <View style={tailwind.style('absolute inset-0')}>
                <Image source={mtIcWavyBg} style={tailwind.style(`absolute inset-0`)} accessible={false} />
                <FullScreenRadialGradient />
            </View>
            <Image
                resizeMode="contain"
                source={mtIcJourneyCompleteBgText}
                style={tailwind.style('', `h-[78px] w-[310px] mt-3`)}
                accessible={false}
            />
            <View
                style={tailwind.style('mx-6 mt-7 mb-6 rounded-[32px] items-center', `w-[${SCREEN_WIDTH - 48}px]`, {
                    backgroundColor: themeColors.share_card_bg_color,
                })}>
                <Image
                    source={{ uri: appConfig.uiConfig.shareRideCardConfig.shareRideGoldIconUri }}
                    style={
                        appConfig.appType === 'multimodal'
                            ? tailwind.style('w-[88px] h-[81px] -mt-[20px]')
                            : tailwind.style('w-[158px] h-[91px] -mt-[25px]')
                    }
                    accessible={true}
                    accessibilityLabel={`${appConfig.textConfig.appReadableName} logo image`}
                />
                <View style={tailwind.style('pt-8 pb-40')}>
                    {isFallback ? (
                        <>
                            <Text
                                style={tailwind.style(
                                    'text-[17px] font-areaNormal-extrabold leading-[23px] -tracking-[0.38px] text-center text-[#FFFFFF]',
                                )}>
                                Thank you for using
                            </Text>
                            <Text
                                style={tailwind.style(
                                    'text-[17px] font-areaNormal-extrabold leading-[23px] -tracking-[0.38px] text-center text-[#FFFFFF] mt-1',
                                )}>
                                Public Transport
                            </Text>
                            <View style={tailwind.style('flex-row items-center justify-center mt-4')}>
                                {journeyModes.map((mode, index) => (
                                    <View
                                        key={`journey-mode-${index}`}
                                        style={tailwind.style('flex-row items-center gap-1')}>
                                        {index > 0 && (
                                            <Text
                                                style={tailwind.style(
                                                    'text-[#FFFFFF] text-[20px] leading-[24px] font-areaNormal-semibold ml-1',
                                                )}>
                                                +
                                            </Text>
                                        )}
                                        {mode === 'metro' ? (
                                            <Icon icon={<MetroIcon />} size={24} color="#FFFFFF" />
                                        ) : (
                                            <Icon icon={getIconFromType(mode, 24, '#FFFFFF')} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <>
                            <Text
                                style={tailwind.style(
                                    'text-[17px] font-areaNormal-extrabold leading-[23px] -tracking-[0.38px] text-center text-[#FFFFFF]',
                                )}>
                                {showMaxValueEitherTimeOrCostTitleText}
                            </Text>
                            <Text
                                style={tailwind.style(
                                    'text-[72px] font-areaNormal-extrabold leading-[78px] -tracking-[0.18px] text-center text-[#FFFFFF] pt-1.5',
                                )}>
                                {showMaxValueEitherTimeOrCost}
                            </Text>
                            {timeSaved > 10 && (
                                <Text
                                    style={tailwind.style(
                                        'text-[44px] font-areaNormal-extrabold leading-[48px] text-center text-[#FFFFFF] pt-1',
                                    )}>
                                    mins
                                </Text>
                            )}
                            <View style={tailwind.style('flex-row items-center gap-2')}>
                                <Text
                                    style={tailwind.style(
                                        'text-[#FFFFFF] text-[17px] leading-[24px] font-areaNormal-extrabold -tracking-[0.38px]',
                                    )}>
                                    {showMaxValueEitherTimeOrCostSubtitleText}
                                </Text>
                                <View style={tailwind.style('flex-row items-center mt-1')}>
                                    {journeyModes.map((mode, index) => (
                                        <View
                                            key={`journey-mode-${index}`}
                                            style={tailwind.style('flex-row items-center gap-1')}>
                                            {index > 0 && (
                                                <Text
                                                    style={tailwind.style(
                                                        'text-[#FFFFFF] text-[17px] leading-[24px] font-areaNormal-semibold ml-1',
                                                    )}>
                                                    +
                                                </Text>
                                            )}
                                            {mode === 'metro' ? (
                                                <Icon icon={<MetroIcon />} size={18} color="#FFFFFF" />
                                            ) : (
                                                <Icon icon={getIconFromType(mode, 18, '#FFFFFF')} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}
                </View>
                {/* STATIC BACKGROUND */}
                <View style={[tailwind.style('absolute inset-0 overflow-hidden rounded-[32px]'), { zIndex: -1 }]}>
                    <Image
                        source={mtIcGradientMask}
                        style={[
                            tailwind.style('absolute w-[404.61px] h-[472.24px]'),
                            { transform: [{ translateY: 135 }, { rotate: '0deg' }, { translateX: -105 }] },
                        ]}
                        accessible={false}
                    />
                    {mode === 'train' && (
                        <Image
                            resizeMode={'contain'}
                            source={mtIcTrainSideView}
                            style={[
                                tailwind.style('absolute -bottom-0.5 left-1/3 w-[400px]  h-[95px]'),
                                { aspectRatio: 1524 / 396, transform: [{ translateX: 0 }, { scaleX: -1 }] },
                            ]}
                            accessible={true}
                            accessibilityLabel="train side view image"
                        />
                    )}
                    {mode === 'bus' && (
                        <Image
                            resizeMode={'contain'}
                            source={mtIcBusSideView}
                            style={[
                                tailwind.style('absolute -bottom-1 left-1/5 w-[400px]  h-[95px]'),
                                { aspectRatio: 908 / 347, transform: [{ translateX: 0 }, { scaleX: -1 }] },
                            ]}
                            accessible={true}
                            accessibilityLabel="bus side view image"
                        />
                    )}
                    {mode === 'metro' && (
                        <Image
                            resizeMode={'contain'}
                            source={mtIcMetroSideView}
                            style={[
                                tailwind.style('absolute -bottom-0 left-1/3 w-[400px]  h-[95px]'),
                                { aspectRatio: 1446 / 363, transform: [{ translateX: 0 }, { scaleX: -1 }] },
                            ]}
                            accessible={true}
                            accessibilityLabel="metro side view image"
                        />
                    )}
                </View>
            </View>
        </View>
    );
};
