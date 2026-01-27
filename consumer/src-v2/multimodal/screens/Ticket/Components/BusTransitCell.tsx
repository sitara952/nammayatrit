import { busLegExtraInfo } from '@/readOnly/api/types/BusLegExtraInfo.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import mtIcBusTransitReview from '../../../../../src-v2/assets/3D-assets/review-transits/mt_ic_bus_transit_review.webp';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { TransitArrowRight } from '../../../components/svg/Arrows';
import { BusIcon } from '../../../components/svg/transport/BusIcon';
import {
    getIconBGFromType,
    getIconSecondaryBGFromType,
} from '../../../screens/JourneyInfoScreen/components/TransitIconWrapper';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type BusCellProps = {
    isLastCell: boolean | undefined;
    legInfo: legInfo;
    onShowTicket: (legInfo: legInfo) => void | undefined;
    appName: string;
    // onClassChange: (selectedValue: busLegServiceTier) => void;
};

const CONTAINER_SECTION = SCREEN_WIDTH - 20 - 32 - 32 - 34;

export const BusTransitCell = React.memo(
    (props: BusCellProps) => {
        const {
            originStop,
            destinationStop,
            providerName: _providerName,
            selectedServiceTier,
            // avaialbleServiceTiers,
            routeName,
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        } = props.legInfo.legExtraInfo._0 as busLegExtraInfo;
        const { handlers, animatedStyle } = useScaleAnimation();
        // const selectedClass = useMemo(() => {
        //     return avaialbleServiceTiers.find(tier => tier.quoteId === props.legInfo.pricingId);
        // }, [avaialbleServiceTiers.length, props.legInfo.pricingId]);

        // useEffect(() => {
        //     if (!selectedClass && avaialbleServiceTiers?.length > 0) {
        //         setSelectedClass(avaialbleServiceTiers[0]);
        //     }
        // }, [avaialbleServiceTiers.length, selectedClass]);

        // const handleOnPress = (selectedValue: busLegServiceTier) => {
        //     setSelectedClass(selectedValue);
        //     // props.onClassChange(selectedValue);
        //     setCollapsed(false);
        // };
        const ordinaryCost = props.legInfo.estimatedMinFare?.amount;
        const configManager = useConfigContext();
        const colors = configManager.get('themeColors');
        const userLanguageStrings = configManager.get('userLanguageStrings');
        return (
            <Animated.View
                layout={LinearTransition.springify().damping(28).stiffness(200)}
                style={tailwind.style('pt-1 w-full')}
                accessibilityLabel={`Bus ${routeName}, service tier ${selectedServiceTier?.serviceTierName}, from ${originStop.name?.toLowerCase()} to ${destinationStop.name?.toLowerCase()}, fare ₹${ordinaryCost}`}>
                <Animated.View style={tailwind.style('flex-row overflow-hidden w-full items-start')}>
                    <Animated.View style={tailwind.style(' w-full overflow-hidden')}>
                        <Animated.View
                            layout={LinearTransition.springify().damping(28).stiffness(200)}
                            style={tailwind.style(
                                'border-[1px] border-[#F1F2F7] rounded-[16px] p-[14px] pt-[11px]  w-full bg-white ',
                            )}>
                            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                                <Animated.View style={tailwind.style('flex-row items-center justify-start')}>
                                    <Animated.View
                                        style={tailwind.style(
                                            'h-7 w-7 items-center justify-center rounded-[10px]',
                                            `bg-[${getIconBGFromType('Bus')}]`,
                                        )}
                                        accessibilityElementsHidden
                                        importantForAccessibility="no-hide-descendants">
                                        <Icon
                                            color={getIconSecondaryBGFromType('Bus')}
                                            icon={<BusIcon fill={undefined} />}
                                            size={16}
                                        />
                                    </Animated.View>
                                    <Animated.View
                                        layout={LinearTransition.springify().damping(28).stiffness(200)}
                                        style={tailwind.style('flex-row items-center justify-between pl-3')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[15px] leading-[18px] font-areaNormal-extrabold text-[#3B3A3C]',
                                            )}>
                                            {`${userLanguageStrings.Bus} ${routeName}`}
                                        </Animated.Text>
                                    </Animated.View>
                                    <Animated.Text
                                        numberOfLines={1}
                                        layout={LinearTransition.springify().damping(28).stiffness(200)}
                                        style={tailwind.style(
                                            'text-[15px] leading-[18px] font-areaNormal-extrabold text-[#ABABAB] pl-2 max-w-[100px]',
                                        )}>
                                        | {selectedServiceTier?.serviceTierName}
                                    </Animated.Text>
                                </Animated.View>
                                {/* <Pressable>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Animated.Text
                                        style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#105BCD]')}>
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
                                <Animated.View
                                    entering={FadeIn.duration(200)}
                                    style={tailwind.style(' items-end justify-end pb-0.5')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[20px] leading-[22px] font-areaNormal-extrabold text-[#313131]',
                                        )}>
                                        <Animated.Text style={tailwind.style('text-[15px] font-inter-bold ')}>
                                            {' '}
                                            ₹{' '}
                                        </Animated.Text>
                                        {ordinaryCost}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                            <Animated.View entering={FadeIn} style={tailwind.style('mt-2.5')}>
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
                            <Animated.View style={tailwind.style('flex-row justify-start items-start relative')}>
                                <Animated.Image
                                    accessible={false}
                                    source={mtIcBusTransitReview}
                                    style={tailwind.style(' w-[87px] h-[99px] absolute -left-4 -top-6')}
                                />
                                <Animated.View style={tailwind.style('pl-[60px] pt-[10px]')}>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C] capitalize',
                                            `max-w-[${CONTAINER_SECTION - 72}px]`,
                                        )}>
                                        {originStop.name}
                                    </Animated.Text>
                                    <Animated.View style={tailwind.style('flex-row items-center pt-2')}>
                                        <Icon color="#7B8997" icon={<TransitArrowRight fill={undefined} />} size={16} />
                                        <Animated.Text
                                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                                            numberOfLines={1}
                                            style={tailwind.style(
                                                'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C] pl-1 capitalize',
                                                `max-w-[${CONTAINER_SECTION - 90}px]`,
                                            )}>
                                            {destinationStop.name}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
                            <Animated.View entering={FadeIn} style={tailwind.style('mt-4.5')}>
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
                            {props.appName !== 'odishaYatri' && (
                                <Pressable
                                    testID={`f15dae7e-d26c-4391-a728-fe1406598dbf`}
                                    style={tailwind.style('pt-[15px]')}
                                    onPress={() => {
                                        props.onShowTicket(props.legInfo);
                                    }}
                                    accessibilityRole="button"
                                    {...handlers}>
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                `bg-[${colors.Button_for_modes_bg}] h-[44px] justify-center w-full items-center flex-row rounded-[12px] gap-[8px]`,
                                            ),
                                            animatedStyle,
                                        ]}>
                                        {/* <TicketIcon /> */}
                                        <Animated.Text
                                            style={tailwind.style(
                                                `text-[12px] font-areaNormal-extrabold text-[${colors.Button_for_modes_text}]`,
                                            )}>
                                            {userLanguageStrings.ShowBusTicket}
                                        </Animated.Text>
                                    </Animated.View>
                                </Pressable>
                            )}
                            {/* <Animated.View style={tailwind.style(' pt-2 flex-col items-start')}>
                            <Animated.Text
                                style={tailwind.style(
                                    ' text-[#969696] text-[11px] leading-[18px] font-areaNormal-extrabold ',
                                )}>
                                {`${userLanguageStrings.ThisTicketIsAlsoValidIn} `}
                            </Animated.Text>
                            <BusList
                                busList={[
                                    { routeCode: '154B', routeNumber: '88B', handleOnPress: () => {} },
                                    { routeCode: '119B', routeNumber: '119B', handleOnPress: () => {} },
                                    { routeCode: '154B', routeNumber: '88B', handleOnPress: () => {} },
                                    { routeCode: '154B', routeNumber: '201A', handleOnPress: () => {} },
                                    { routeCode: '154B', routeNumber: '201A', handleOnPress: () => {} },
                                ]}
                                isLoading={false}
                                showIcon={false}
                                isTicket={true}
                            />
                        </Animated.View> */}
                            {/* <Animated.View
                            layout={LinearTransition.springify().damping(28).stiffness(300)}
                            style={tailwind.style(' bg-white rounded-2xl')}>
                            {collapsed ? (
                                <Animated.View
                                    entering={FadeIn.delay(100)}
                                    style={tailwind.style('pt-3 flex flex-row')}>
                                    {avaialbleServiceTiers.map((busClass, index) => {
                                        return (
                                            <ClassOption
                                                key={index}
                                                item={busClass}
                                                index={index}
                                                isSelected={busClass.serviceTierType === selectedClass?.serviceTierType}
                                                handlePressCallback={handleOnPress}
                                            />
                                        );
                                    })}
                                </Animated.View>
                            ) : null}
                        </Animated.View> */}
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        );
    },
    () => {
        return true;
    },
);

// type ClassOptionsProps = {
//     isSelected: boolean;
//     item: busLegServiceTier;
//     index: number;
//     handlePressCallback: (selectedValue: busLegServiceTier) => void;
// };

// const _ClassOption = ({ isSelected, item, index, handlePressCallback }: ClassOptionsProps) => {
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
//                         'text-[13px] font-areaNormal-bold text-[#69666C]',
//                         isSelected ? 'text-white' : 'text-[#69666C]',
//                     )}>
//                     {item.serviceTierName}
//                 </Animated.Text>
//             </Animated.View>
//         </Pressable>
//     );
// };
