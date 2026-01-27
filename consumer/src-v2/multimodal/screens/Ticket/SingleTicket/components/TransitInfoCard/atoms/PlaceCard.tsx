import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface PlaceCardProps {
    type: 'Source' | 'Destination' | 'Switch';
    title: string;
    regionalTitle: string;
    renderLine: boolean;
    fleetNo: string | undefined;
}

export const PlaceCard = (props: PlaceCardProps) => {
    const { type, title, regionalTitle, renderLine = true } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View accessible={false}>
            <View style={tailwind.style('flex-row items-center gap-1')} accessible={false}>
                {type === 'Destination' ? (
                    <Icon icon={<TransitArrowRight fill={undefined} />} size={12} color="#7E7E7E" />
                ) : null}
                <Text
                    accessible={false}
                    style={tailwind.style(
                        'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.2px]',
                    )}>
                    {type === 'Source'
                        ? userLanguageStrings.Source
                        : type === 'Destination'
                          ? userLanguageStrings.Destination
                          : userLanguageStrings.Switch}
                </Text>
            </View>
            <Text
                accessible={false}
                numberOfLines={1}
                style={tailwind.style(
                    'text-[15px] capitalize leading-[18px] font-areaNormal-extrabold text-[#3B3A3C] pt-3',
                )}>
                {title}
            </Text>
            {regionalTitle ? (
                <Text
                    accessible={false}
                    numberOfLines={1}
                    style={tailwind.style(
                        'text-[12px] leading-[15px] font-areaNormal-extrabold text-[#656565] tracking-[0.2px] pt-2.5',
                    )}>
                    {regionalTitle}
                </Text>
            ) : null}
            {renderLine ? (
                <Svg height={1} style={tailwind.style('mt-4')} accessible={false}>
                    <Line
                        strokeDasharray="5, 10"
                        x1={0}
                        x2={SCREEN_WIDTH}
                        y1={1}
                        y2={1}
                        stroke="#E5E5E5"
                        strokeWidth="2"
                    />
                </Svg>
            ) : null}
        </View>
    );
};
