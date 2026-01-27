import React from 'react';
import { View, Dimensions } from 'react-native';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import token from '@/typescript/designSystem/tokens/index';

const RideConfirmedShimmer: React.FC = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <View style={tailwind.style(`p-[${token?.spacing?.[16]}] flex-col gap-[24px]`)}>
            {/* ChatView */}
            <View
                style={tailwind.style(
                    `h-[112px] justify-center rounded-[${token?.corner?.md}] bg-[${themeColors.Fill_neutralMin}] border-[${themeColors.Fill_neutralMin}] p-[${token?.spacing?.[16]}]`,
                )}>
                <ContentLoader height={16}>
                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                </ContentLoader>
                <View style={tailwind.style('my-[12px]')}>
                    <Divider
                        type="dashed"
                        direction={undefined}
                        style={undefined}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />
                </View>
                <View style={tailwind.style('flex-row gap-[8px] overflow-hidden')}>
                    <ContentLoader width={52} height={40}>
                        <Rect x="0" y="0" rx="20" ry="20" width="100%" height="100%" />
                    </ContentLoader>
                    <ContentLoader width={155} height={40}>
                        <Rect x="0" y="0" rx="20" ry="20" width="100%" height="100%" />
                    </ContentLoader>
                    <ContentLoader width={155} height={40}>
                        <Rect x="0" y="0" rx="20" ry="20" width="100%" height="100%" />
                    </ContentLoader>
                </View>
            </View>
            {/* Driver Info Card */}
            <View
                style={tailwind.style(
                    `h-[162px] justify-center rounded-[${token?.corner?.md}] bg-[${themeColors.Fill_neutralMin}] border-[${themeColors.Fill_neutralMin}] p-[${token?.spacing?.[16]}]`,
                )}>
                <View style={tailwind.style(`flex-row justify-between items-center`)}>
                    <View style={tailwind.style(`flex-col`)}>
                        <View style={tailwind.style(`flex-row items-center`)}>
                            <ContentLoader height={46} width={58}>
                                <Rect x="0" y="0" rx="24" ry="24" width="100%" height="100%" />
                            </ContentLoader>
                            <View style={tailwind.style('flex-col ml-[10px] gap-[6px]')}>
                                <ContentLoader height={16} width={97}>
                                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                                </ContentLoader>
                                <ContentLoader height={16} width={97}>
                                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                                </ContentLoader>
                            </View>
                        </View>
                        <View style={tailwind.style('my-[16px]')}>
                            <Divider
                                type="dashed"
                                direction={undefined}
                                style={undefined}
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                                dividerColor={undefined}
                                strokeDashArray={undefined}
                            />
                        </View>
                        <View style={tailwind.style(`flex-col gap-[8px]`)}>
                            <ContentLoader height={16} width={97}>
                                <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                            </ContentLoader>
                            <View style={tailwind.style(`flex-row gap-[5px]`)}>
                                {[1, 2, 3].map((_, index) => (
                                    <ContentLoader key={index} height={16} width={43}>
                                        <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                                    </ContentLoader>
                                ))}
                            </View>
                        </View>
                    </View>
                    <ContentLoader height={82} width={101}>
                        <Rect x="0" y="0" rx="22" ry="22" width="100%" height="100%" />
                    </ContentLoader>
                </View>
            </View>
            {/* Tool Center */}
            <View style={tailwind.style(`flex-col gap-[12px]`)}>
                <ContentLoader width={57} height={20}>
                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                </ContentLoader>
                <View style={tailwind.style('flex-row justify-between')}>
                    {[1, 2, 3].map((_, index) => {
                        const itemWidth = (Dimensions.get('screen').width - 56) / 3;
                        const titleWidth = (Dimensions.get('screen').width - 56) / 3 - 50;
                        return (
                            <View
                                key={index}
                                style={tailwind.style(
                                    `flex-row h-[44px] w-[${itemWidth}px] justify-center items-center rounded-[12px] bg-[${themeColors.Fill_neutralMin}] gap-[6px]`,
                                )}>
                                <ContentLoader width={20} height={20}>
                                    <Rect x="0" y="0" rx="10" ry="10" width="20" height="20" />
                                </ContentLoader>
                                <ContentLoader height={20} width={titleWidth}>
                                    <Rect x="0" y="0" rx="10" ry="10" width={titleWidth} height="20" />
                                </ContentLoader>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

export default RideConfirmedShimmer;
