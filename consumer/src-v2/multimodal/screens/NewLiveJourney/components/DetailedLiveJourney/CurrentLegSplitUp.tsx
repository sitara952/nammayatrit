import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Icon } from '../../../../components/common/Icon';
import Shimmer from '../../../../screens/Search/components/SearchSectionListItem/Shimmer';
import { CaretDown, CaretRight } from '../../assets/svg/Caret';
import { getIconFromType } from '../../utils/getTransitIconUtils';
import { Spinner } from '@/src-v2/multimodal/components/common/Spinner/UI';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface LegItem {
    type: MultimodalTravelMode_multimodalTravelMode | 'Wait' | 'Tick';
    durationInfo: string;
    description: string;
    isMarquee: boolean;
    renderType: 'list' | 'card';
    hyperlink:
        | {
              text: string;
              onPress: () => void;
              isLoading: boolean;
          }
        | undefined;
}

const isTick = (type: MultimodalTravelMode_multimodalTravelMode | 'Wait' | 'Tick'): type is 'Tick' => {
    return type === 'Tick';
};

const InfoCardShimmer: React.FC<{ renderType: 'list' | 'card' }> = ({ renderType }) => {
    return (
        <Animated.View
            entering={FadeIn.duration(350)}
            exiting={FadeOut.duration(100)}
            style={tailwind.style(
                'border-[1px] border-[#F1F2F2] p-3 rounded-2xl overflow-hidden bg-white',
                renderType === 'card' ? 'flex-1' : '',
            )}>
            <View style={tailwind.style('flex-row items-center justify-between')}>
                <View style={tailwind.style('flex-row items-center')}>
                    {/* Icon shimmer */}
                    <Shimmer width={14} height={14} borderRadius={7} />
                    {/* Duration info shimmer */}
                    <View style={tailwind.style('ml-1')}>
                        <Shimmer width={renderType === 'card' ? 45 : 160} height={17} borderRadius={4} />
                    </View>
                </View>
            </View>
            {/* Description shimmer */}
            <View style={tailwind.style('mt-2')}>
                <Shimmer width="100%" height={17} borderRadius={4} />
            </View>
        </Animated.View>
    );
};

const InfoCard = (props: LegItem) => {
    const { type, durationInfo, description, isMarquee, renderType } = props;
    const userLanguageStrings = useConfigContext().get('userLanguageStrings');
    return (
        <Animated.View
            entering={FadeIn.duration(350)}
            exiting={FadeOut.duration(100)}
            style={tailwind.style(
                'border-[1px] border-[#F1F2F2] p-3 rounded-2xl overflow-hidden bg-white',
                renderType === 'card' ? 'flex-1' : '',
            )}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <Animated.View style={tailwind.style('flex-row items-center')}>
                    {getIconFromType(type, 14, '#7E7E7E', false)}
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] pl-1',
                            isTick(type) ? 'text-[#09941E]' : ' text-[#7E7E7E]',
                        )}>
                        {isTick(type) ? userLanguageStrings.Done : durationInfo}
                    </Animated.Text>
                </Animated.View>
                {props.hyperlink ? (
                    props.hyperlink.isLoading ? (
                        <View style={tailwind.style('pr-3')}>
                            <Spinner size="lg" themeColor="primary" track="transparent" stroke={'#016ACD'} />
                        </View>
                    ) : (
                        <Pressable
                            accessibilityLabel={props.hyperlink.text + ' button'}
                            accessibilityRole="button"
                            testID="check-in-button"
                            hitSlop={10}
                            onPress={props.hyperlink.onPress}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#016ACD]',
                                )}>
                                {props.hyperlink.text}
                            </Animated.Text>
                        </Pressable>
                    )
                ) : null}
            </Animated.View>
            {isMarquee && !isTick(type) ? (
                <Marquee spacing={12} speed={0.35} withGesture>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#3B3A3C] pt-2',
                            isTick(type) ? 'text-[#969696]' : ' text-[#3B3A3C]',
                        )}>
                        {description}
                    </Animated.Text>
                </Marquee>
            ) : (
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style(
                        'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] pt-2',
                        isTick(type) ? 'text-[#969696]' : ' text-[#3B3A3C]',
                    )}>
                    {description}
                </Animated.Text>
            )}
        </Animated.View>
    );
};

interface InfoConnectIconProps {
    direction: 'horizontal' | 'vertical';
}

const InfoConnectIcon = (props: InfoConnectIconProps) => {
    const { direction } = props;
    return direction === 'horizontal' ? (
        <Animated.View style={tailwind.style('items-center justify-center')}>
            <Icon icon={<CaretRight fill="#969696" />} size={12} />
        </Animated.View>
    ) : (
        <Animated.View style={tailwind.style('pl-[14px]')}>
            <Icon icon={<CaretDown fill="#969696" />} size={12} />
        </Animated.View>
    );
};

export interface LegItemData {
    type: MultimodalTravelMode_multimodalTravelMode | 'Wait' | 'Tick';
    durationInfo: string;
    description: string;
    isMarquee: boolean;
    hyperlink:
        | {
              text: string;
              onPress: () => void;
              isLoading: boolean;
          }
        | undefined;
}

export interface CurrentLegSplitUpProps {
    orientation: 'horizontal' | 'vertical';
    legs: LegItemData[];
    isLoading?: boolean;
}

export const CurrentLegSplitUp: React.FC<CurrentLegSplitUpProps> = props => {
    const { orientation, legs, isLoading } = props;

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(340)}
            style={tailwind.style('p-4', orientation === 'horizontal' ? 'flex-row gap-1.5' : 'flex-col gap-2')}>
            {isLoading ? (
                <>
                    {[1, 2, 3].map((_, index) => (
                        <React.Fragment key={index}>
                            <InfoCardShimmer renderType={orientation === 'horizontal' ? 'card' : 'list'} />
                            {index < 2 && <InfoConnectIcon direction={orientation} />}
                        </React.Fragment>
                    ))}
                </>
            ) : null}
            {!isLoading
                ? legs.map((leg, index) => (
                      <React.Fragment key={index}>
                          <InfoCard
                              renderType={orientation === 'horizontal' ? 'card' : 'list'}
                              isMarquee={leg.isMarquee}
                              type={leg.type}
                              durationInfo={leg.durationInfo}
                              description={leg.description}
                              hyperlink={leg.hyperlink}
                          />
                          {index < legs.length - 1 && <InfoConnectIcon direction={orientation} />}
                      </React.Fragment>
                  ))
                : null}
        </Animated.View>
    );
};
