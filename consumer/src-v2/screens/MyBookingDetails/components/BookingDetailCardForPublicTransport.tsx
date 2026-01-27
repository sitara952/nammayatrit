import React from 'react';
import Animated from 'react-native-reanimated';
import { View, Image } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import {
    getIconBGFromType,
    getIconFromType,
} from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TransitIconWrapper';
import { getIconSecondaryBGFromType } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TransitIconWrapper';
import { Icon } from '@/typescript/components/Icon';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import transitMetro from '@/src-v2/assets/3D-assets/transits/transit_metro.webp';
import mtcIcBlueBus from '@/src-v2/assets/mtc_ic_blue_bus.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getCategoryDisplayName } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/CategorySelector';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

export type BookingDetailCardForPublicTransportProps = {
    mode: 'Bus' | 'Metro';
    header: string;
    fare: string;
    source: string;
    destination: string;
    categories: categoryInfoResponse[] | undefined;
    issueListComponent: React.ReactNode | undefined;
};

const BookingDetailCardForPublicTransport: React.FC<BookingDetailCardForPublicTransportProps> = ({
    mode,
    header,
    fare,
    source,
    destination,
    categories,
    issueListComponent,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            style={[
                tailwind.style('bg-white rounded-[16px] shadow-md w-full pl-[18px] pr-[18px] py-3'),
                { overflow: 'hidden' },
            ]}>
            <Animated.View style={tailwind.style('flex-row items-center mb-[18px] gap-1')}>
                <Animated.View
                    style={tailwind.style(
                        'h-[24px] w-[24px] items-center justify-center rounded-[10px]',
                        `bg-[${getIconBGFromType(mode)}]`,
                    )}>
                    {getIconFromType(mode, 14, getIconSecondaryBGFromType(mode))}
                </Animated.View>
                <Animated.Text
                    style={[
                        tailwind.style(
                            'text-[#2F2F2F] pl-[8px] font-areaNormal-semibold leading-[14.97px] tracking-[0.2px]',
                        ),
                        { fontSize: 10.97 },
                    ]}>
                    {mode === 'Metro' ? userLanguageStrings.Metro : header}
                </Animated.Text>
                {mode === 'Bus' ? (
                    <Image
                        accessible={false}
                        source={mtcIcBlueBus}
                        style={[
                            tailwind.style('absolute right-[-100px] top-[-18px] w-[168px] h-[70px]'),
                            { resizeMode: 'cover' },
                        ]}
                    />
                ) : (
                    <Image
                        accessible={false}
                        source={transitMetro}
                        style={[
                            tailwind.style('absolute right-[-110px] top-[-30px] w-[168px] h-[80px]'),
                            { resizeMode: 'cover', transform: [{ scaleX: -1 }] },
                        ]}
                    />
                )}
            </Animated.View>

            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <View style={tailwind.style('flex-col flex-1')}>
                    <Animated.Text
                        style={[
                            tailwind.style(
                                'text-[#2F2F2F] font-areaNormal-semibold leading-[16px] tracking-[0.2px] mb-[8px]',
                            ),
                            { fontSize: 12 },
                        ]}
                        numberOfLines={1}>
                        {source}
                    </Animated.Text>
                    <View style={tailwind.style('flex-row items-center')}>
                        <Icon
                            color="#7B8997"
                            style={tailwind.style('mr-[6px]')}
                            icon={<TransitArrowRight fill={undefined} />}
                            size={12}
                        />
                        <Animated.Text
                            style={[
                                tailwind.style(
                                    'text-[#2F2F2F] font-areaNormal-semibold leading-[16px] tracking-[0.2px]',
                                ),
                                { fontSize: 12 },
                            ]}
                            numberOfLines={1}>
                            {destination}
                        </Animated.Text>
                    </View>
                </View>
                {fare !== '' ? (
                    <Animated.Text
                        style={[
                            tailwind.style(
                                'text-[#2F2F2F] text-right font-areaNormal-semibold leading-[22px] tracking-[0.2px] mt-[14px]',
                            ),
                            { fontSize: 18.97 },
                        ]}>
                        {fare}
                    </Animated.Text>
                ) : (
                    <></>
                )}
            </Animated.View>

            <Animated.View style={tailwind.style('border-b border-dashed border-[#E5E5E5] mt-[22px]')} />

            {categories?.map(category => {
                const quantity = category.categorySelectedQuantity || 0;
                if (quantity === 0) return null;
                return (
                    <Animated.View style={tailwind.style('mb-2 mt-[14px]')}>
                        <Animated.Text
                            style={[
                                tailwind.style(
                                    'text-[#2F2F2F] font-areaNormal-semibold leading-[14.97px] tracking-[0.2px]',
                                ),
                                { fontSize: 10.97 },
                            ]}>
                            {getCategoryDisplayName(category.categoryMeta?.title ?? category.categoryName)}: {quantity}
                        </Animated.Text>
                    </Animated.View>
                );
            })}
            {issueListComponent && (
                <Animated.View style={tailwind.style('mt-2 -mx-[18px]')}>
                    <Animated.View style={tailwind.style('border-b border-dashed border-[#E5E5E5]')} />
                    {issueListComponent}
                </Animated.View>
            )}
        </Animated.View>
    );
};

export default BookingDetailCardForPublicTransport;
