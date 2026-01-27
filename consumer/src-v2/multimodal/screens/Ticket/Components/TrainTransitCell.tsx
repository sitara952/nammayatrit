import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { subwayLegExtraInfo } from '@/readOnly/api/types/SubwayLegExtraInfo.gen';
import { TrainIcon } from '@/src-v2/multimodal/components/svg/transport/TrainIcon';
import { getIconBGFromType } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TransitIconWrapper';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import mtIcTrainTransitReview from '../../../../assets/3D-assets/review-transits/mt_ic_train_transit_review.webp';
import ViaPointIcon from '@/src-v2/assets/svg/ViaPointIcon';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { TransitArrowRight } from '../../../components/svg/Arrows';
import { legServiceTier } from '@/readOnly/api/types/LegServiceTier.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Image } from 'react-native';

export const TicketIcon = () => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const fill = colors.Button_for_modes_text || '#fff';
    return (
        <Svg width={10} height={12} viewBox="0 0 10 12" fill="none">
            <Path
                d="M2.911.052s-.03-.031-.04-.031c0 0-.02 0-.03-.01H.628A.64.64 0 000 .664v10.67c0 .363.29.665.638.665h2.214s.02 0 .03-.01c0 0 .02-.01.04-.032L4.127 10.7a1.19 1.19 0 011.755 0l1.206 1.248s.03.031.04.031c0 0 .02 0 .03.01H9.372a.64.64 0 00.628-.654V.665C10 .302 9.71 0 9.362 0H7.198h-.05s-.02 0-.03.01c0 0-.02.01-.04.032L5.873 1.3a1.19 1.19 0 01-1.755 0L2.912.042v.01z"
                fill={fill}
            />
        </Svg>
    );
};

type TrainTransitCellProps = {
    isLastCell: boolean;
    legInfo: legInfo;
    onShowTicketPress: () => void;
};

const CONTAINER_SECTION = SCREEN_WIDTH - 20 - 32 - 32 - 34;

export const TrainTransitCell: React.FC<TrainTransitCellProps> = ({
    // isLastCell,
    legInfo,
    // onClassChange,
    onShowTicketPress,
}) => {
    // const [collapsed, setCollapsed] = useState(false);

    const legExtraInfo: subwayLegExtraInfo | undefined =
        legInfo.legExtraInfo.TAG === 'Subway' ? legInfo.legExtraInfo._0 : undefined;

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const defaultServiceTier = undefined;

    const [selectedClass, setSelectedClass] = useState<legServiceTier | undefined>(defaultServiceTier);
    const route = legExtraInfo?.routeInfo?.[0];
    const destinationStop = legExtraInfo?.routeInfo.at(-1)?.destinationStop;
    useEffect(() => {
        if (!selectedClass && defaultServiceTier) {
            setSelectedClass(defaultServiceTier);
        }
    }, [defaultServiceTier, selectedClass]);
    const { handlers, animatedStyle } = useScaleAnimation();
    if (!route) return;
    const { originStop } = route;
    const ticketValidity = legExtraInfo?.ticketValidityHours?.[0];
    const hasTicketValidity = ticketValidity !== undefined && ticketValidity !== null && ticketValidity !== 0;

    // const handleOnPress = (selectedValue: busLegServiceTier) => {
    //     setSelectedClass(selectedValue);
    //     props.onClassChange(selectedValue);
    //     setCollapsed(false);
    // };
    const colors = configManager.get('themeColors');
    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(200)}
            style={tailwind.style(' pt-1')}
            accessibilityLabel={`Train route from ${originStop.name?.toLowerCase()} to ${destinationStop?.name?.toLowerCase()}, service tier ${selectedClass?.serviceTierName || legExtraInfo?.selectedServiceTier?.serviceTierName || 'N/A'}, fare ₹${selectedClass?.fare?.amount ?? legInfo.estimatedMinFare?.amount ?? 0}`}>
            <Animated.View style={tailwind.style('flex-row overflow-hidden')}>
                <Animated.View style={tailwind.style(' w-full')}>
                    <Animated.View
                        layout={LinearTransition.springify().damping(28).stiffness(200)}
                        style={tailwind.style(
                            'border-[1px] border-[#F1F2F7] rounded-[14px] p-[14px] pt-4  w-full bg-white',
                        )}>
                        <Image
                            accessible={false}
                            source={mtIcTrainTransitReview}
                            resizeMode="contain"
                            style={tailwind.style('absolute bottom-[125px] left-0 w-[87px] h-[99px]')}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                        />
                        <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                            <Animated.View style={tailwind.style('flex-row items-center')}>
                                <Animated.View
                                    style={tailwind.style(
                                        'h-7 w-7 items-center justify-center rounded-[10px]',
                                        `bg-[${getIconBGFromType('Subway')}]`,
                                    )}>
                                    <Icon color="#17402F" icon={<TrainIcon fill={undefined} />} size={16} />
                                </Animated.View>
                                <Animated.View
                                    layout={LinearTransition.springify().damping(28).stiffness(200)}
                                    style={tailwind.style('flex-row items-center pl-2')}>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(28).stiffness(200)}
                                        style={tailwind.style(
                                            'text-[15px] leading-[18px] font-areaNormal-extrabold text-[#3B3A3C]',
                                        )}>
                                        {userLanguageStrings.LocalTrain}
                                    </Animated.Text>
                                    <Animated.Text
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            ' text-[15px] leading-[18px] font-areaNormal-extrabold text-[#ABABAB] pl-2 max-w-[100px]',
                                        )}>
                                        |{' '}
                                        {selectedClass?.serviceTierName ||
                                            legExtraInfo?.selectedServiceTier?.serviceTierName ||
                                            'N/A'}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                            {/* Change Class -> Open Bottom Sheet */}
                            {/* <Pressable>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#105BCD]')}>
                                        Change
                                    </Animated.Text>
                                    <Icon
                                        color="#105BCD"
                                        style={tailwind.style('-mb-0.5 ml-0.5')}
                                        icon={<ChevronRight />}
                                        size={12}
                                    />
                                </Animated.View>
                            </Pressable> */}
                            <Animated.Text
                                style={tailwind.style('text-[20px] font-areaNormal-extrabold text-[#313131]')}>
                                <Animated.Text style={tailwind.style('text-[15px] font-inter-bold ')}>
                                    {' '}
                                    ₹{' '}
                                </Animated.Text>
                                {selectedClass?.fare?.amount ?? legInfo.estimatedMinFare?.amount ?? 0}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View entering={FadeIn} style={tailwind.style('pt-2.5')}>
                            <Svg height={1}>
                                <Line
                                    strokeDasharray="5.2, 7"
                                    x1={0}
                                    x2={SCREEN_WIDTH}
                                    y1={1}
                                    y2={1}
                                    stroke="#F5F5F5"
                                    strokeWidth="2"
                                />
                            </Svg>
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex-row justify-between items-end mb-[20px]')}>
                            <Animated.View style={tailwind.style('pl-[60px] pt-[17px]')}>
                                <Animated.Text
                                    layout={LinearTransition.springify().damping(30).stiffness(200)}
                                    numberOfLines={1}
                                    style={tailwind.style(
                                        'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C]',
                                        `max-w-[${CONTAINER_SECTION - 92}px]`,
                                    )}>
                                    {originStop.name}
                                </Animated.Text>
                                <Animated.View style={tailwind.style('flex-row items-center pt-2')}>
                                    <Icon color="#7B8997" icon={<TransitArrowRight fill={undefined} />} size={16} />
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C] pl-1',
                                            `max-w-[${CONTAINER_SECTION - 92}px]`,
                                        )}>
                                        {destinationStop?.name}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                        <Animated.View entering={FadeIn} style={tailwind.style('')}>
                            <Svg height={1}>
                                <Line
                                    strokeDasharray="5.2, 7"
                                    x1={0}
                                    x2={SCREEN_WIDTH}
                                    y1={1}
                                    y2={1}
                                    stroke="#F5F5F5"
                                    strokeWidth="2"
                                />
                            </Svg>
                        </Animated.View>

                        <Animated.View>
                            <Animated.View style={tailwind.style('flex-row items-center justify-between pt-[12px]')}>
                                <Animated.Text
                                    style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#656565]')}>
                                    {`${userLanguageStrings.Train} ${route?.trainNumber || ''} ${userLanguageStrings.To} ${destinationStop?.name}`}
                                </Animated.Text>
                                {route?.platformNumber !== undefined && (
                                    <Animated.Text
                                        style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#656565]')}>
                                        {`${userLanguageStrings.Pt}: ${route?.platformNumber}`}
                                    </Animated.Text>
                                )}
                            </Animated.View>
                            {legExtraInfo?.selectedServiceTier?.via?.trim() && (
                                <Animated.View style={tailwind.style('flex-row items-center gap-[8px] pt-[9px]')}>
                                    <ViaPointIcon />
                                    <Animated.Text
                                        style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#656565]')}>
                                        {userLanguageStrings.ViaPoint}: {legExtraInfo?.selectedServiceTier?.via}
                                    </Animated.Text>
                                </Animated.View>
                            )}
                        </Animated.View>

                        <Pressable
                            testID={`f15dae7e-d26c-4391-a728-fe1406598dbf`}
                            style={tailwind.style('pt-[15px]')}
                            accessibilityRole="button"
                            onPress={onShowTicketPress}
                            {...handlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        `bg-[${colors.Button_for_modes_bg}] w-full h-[44px] w-full justify-center items-center flex-row rounded-[12px] gap-[8px]`,
                                    ),
                                    animatedStyle,
                                ]}>
                                <TicketIcon />
                                <Animated.Text
                                    style={tailwind.style(
                                        `text-[12px] font-areaNormal-extrabold text-[${colors.Button_for_modes_text}]`,
                                    )}>
                                    {userLanguageStrings.ShowOriginalTrainTicket}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                        {hasTicketValidity ? (
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] font-areaNormal-extrabold text-black text-[#969696] pt-[12px]',
                                )}>
                                {userLanguageStrings.TheTrainJourneyMustStartWithinHoursOfTheTicketBeingIssued(
                                    ticketValidity,
                                )}
                            </Animated.Text>
                        ) : null}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

// type ClassOptionsProps = {
//     isSelected: boolean;
//     item: busLegServiceTier;
//     index: number;
//     handlePressCallback: (selectedValue: busLegServiceTier) => void;
// };

// const ClassOption = ({ isSelected, item, index, handlePressCallback }: ClassOptionsProps) => {
//     const { animatedStyle, handlers } = useScaleAnimation();

//     return (
//         <Pressable {...handlers} onPress={() => handlePressCallback(item)}>
//             <Animated.View
//                 style={[
//                     tailwind.style(
//                         'h-9 rounded-[20px] px-3 items-center justify-center border border-[#E9E9E9]',
//                         index !== 0 ? 'ml-2' : '',
//                         isSelected ? 'bg-black border-black' : '',
//                     ),
//                     animatedStyle,
//                 ]}>
//                 <Animated.Text
//                     style={tailwind.style(
//                         'text-[14px] font-areaNormal-bold text-[#69666C]',
//                         isSelected ? 'text-white' : 'text-[#69666C]',
//                     )}>
//                     {item.serviceTierName}
//                 </Animated.Text>
//             </Animated.View>
//         </Pressable>
//     );
// };
