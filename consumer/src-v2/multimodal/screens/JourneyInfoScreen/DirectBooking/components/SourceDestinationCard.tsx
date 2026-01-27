import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '../../../../components/common/Icon';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { TransitArrowRight } from '../../../../components/svg/Arrows';
import { isUndefined } from 'lodash';
import { TransitSummaryType } from '../../components/TransitSummary';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';

type ShimmerEffectProps = {
    style: StyleProp<ViewStyle> | undefined;
    height: number | undefined;
    width: number | undefined;
};

export const ShimmerEffect = ({ style, height = 10, width = 40 }: ShimmerEffectProps) => (
    <ContentLoader
        style={[tailwind.style('flex-1'), style]}
        height={height}
        width={width}
        backgroundColor="#E8E8E8"
        foregroundColor="#DEDEDE">
        <Rect x="0" y="0" width={width} height={height} />
    </ContentLoader>
);

export const NammaTransitHeader = () => {
    const appConfig = useAppSelector(selectAppConfig);

    return appConfig.appType !== 'multimodal' ? (
        <View style={tailwind.style('px-4 py-3')}>
            <View style={tailwind.style('flex-row justify-between items-center')}>
                <Text
                    style={tailwind.style('text-[16px] text-[#333333] font-areaNormal-bold')}
                    accessible
                    accessibilityRole={'header'}>
                    {appConfig.textConfig.publicTransitText}
                </Text>
            </View>
        </View>
    ) : null;
};

interface SourceDestinationCardProps {
    source: string;
    destination: string;
    fare: number | undefined;
    time: string | undefined;
    journeyTypes: TransitSummaryType[] | undefined;
    isMultiModal: boolean;
    onPress: () => void;
    showFare: boolean;
    fetchingLegsFare?: boolean;
}

export const SourceDestinationCard = ({
    source,
    destination,
    fare,
    time,
    journeyTypes,
    isMultiModal,
    onPress = () => {},
    showFare,
    fetchingLegsFare = false,
}: SourceDestinationCardProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);
    return (
        <View>
            {/* Header Section */}
            {(journeyTypes?.length ?? 0) > 1 && <NammaTransitHeader />}

            {/* Journey Card */}
            <Pressable
                accessibilityRole="button"
                onPress={onPress}
                testID="source-destination-card"
                accessibilityLabel={`View journey details from ${source} to ${destination}${showFare && fare ? `, fare ${fare} rupees` : ''} button`}>
                <Animated.View
                    style={tailwind.style(
                        'p-4 rounded-[20px] flex-row justify-between items-center',
                        isMultiModal ? 'border border-[#E6E6E6]' : 'bg-white border border-[#F1F2F2]',
                    )}>
                    <View
                        style={tailwind.style('flex-grow')}
                        accessibilityLabel={`Journey from ${source} to ${destination}`}>
                        <Text
                            style={tailwind.style(
                                'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] capitalize max-w-3/5',
                            )}
                            numberOfLines={1}>
                            {source}
                        </Text>
                        <View style={tailwind.style('flex-row items-center')}>
                            <Icon icon={<TransitArrowRight />} size={16} style={tailwind.style('mt-5 mr-2')} />
                            <Text
                                style={tailwind.style(
                                    'text-[14px] text-[#3B3A3C] pt-[18px] font-areaNormal-extrabold capitalize',
                                    `max-w-[${SCREEN_WIDTH - 32 - 95 - 32 - 36}px]`,
                                )}
                                numberOfLines={1}>
                                {destination}
                            </Text>
                        </View>
                    </View>
                    <Animated.View style={tailwind.style('items-end')}>
                        {isUndefined(fare) && showFare && <ShimmerEffect style={undefined} height={25} width={20} />}
                        {!isUndefined(fare) && showFare && (
                            <Animated.View
                                style={tailwind.style('flex-row items-end')}
                                accessibilityLabel={`Total fare is ${fare} rupees`}>
                                <Text style={tailwind.style('font-inter-bold text-[14px] text-[#313131] pb-0.5')}>
                                    ₹{' '}
                                </Text>
                                <Text
                                    style={tailwind.style(
                                        'text-[24px] font-areaNormal-semibold text-[#313131] flex-row items-center',
                                    )}>
                                    {journeyTypes?.length === 0 || fare <= 0 || fetchingLegsFare ? (
                                        <ShimmerEffect style={undefined} height={25} width={20} />
                                    ) : (
                                        fare
                                    )}
                                </Text>
                            </Animated.View>
                        )}
                        {isMultiModal &&
                            !appConfig.uiConfig.includeAutoFareInTransitFare &&
                            !fetchingLegsFare && ( //ideally should be from backend
                                <View style={tailwind.style('flex-row items-center pt-[7px]')}>
                                    <Text
                                        style={tailwind.style(
                                            'text-[12px] tracking-[0.2px] text-[#969696] font-areaNormal-extrabold',
                                        )}>
                                        {userLanguageStrings.ExcludingAuto}
                                    </Text>
                                </View>
                            )}
                        {!isUndefined(time) && !isMultiModal && (
                            <View style={tailwind.style('flex-row items-center pt-[7px]')}>
                                <Text
                                    style={tailwind.style(
                                        'text-[12px] tracking-[0.2px] text-[#969696] font-areaNormal-bold',
                                    )}
                                    accessibilityLabel={`Total duration of journey is ${time} minutes`}>
                                    {time}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                </Animated.View>
            </Pressable>
        </View>
    );
};
