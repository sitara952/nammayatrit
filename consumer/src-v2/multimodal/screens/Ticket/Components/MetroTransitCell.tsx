import mtIcMetroTransitReview from '../../../../assets/3D-assets/review-transits/mt_ic_metro_transit_review.webp';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { TransitArrowRight } from '../../../components/svg/Arrows';
import { ShuffleHorizontal } from '../../../components/svg/ShuffleHorizontal';
import { MetroIndicator } from '../../../components/svg/MetroIndicator';
import Svg, { Line } from 'react-native-svg';
import { getIconBGFromType } from '../../JourneyInfoScreen/components/TransitIconWrapper';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils';

type MetroTransitCellProps = {
    isLastCell: boolean | undefined;
    legInfo: legInfo;
    ticketId: string | undefined;
    appName: string;
};

const CONTAINER_SECTION = SCREEN_WIDTH - 20 - 32 - 32 - 34;
export const MetroTransitCell = (props: MetroTransitCellProps) => {
    const { legInfo } = props;
    const configManager = useConfigContext();

    const routeInfo = legInfo.legExtraInfo.TAG === 'Metro' ? legInfo.legExtraInfo._0.routeInfo : undefined;

    if (!routeInfo || !routeInfo?.length || routeInfo?.some(r => r === undefined)) return;

    const sortedRoute = routeInfo.every(r => r.subOrder !== undefined)
        ? [...routeInfo].sort((route1, route2) =>
              route1.subOrder !== undefined && route2.subOrder !== undefined ? route1.subOrder - route2.subOrder : 0,
          )
        : routeInfo;

    const originStop = sortedRoute?.[0]?.originStop;
    const destinationStop = sortedRoute?.[sortedRoute.length - 1]?.destinationStop;
    const lineColors = sortedRoute.map(sortedRoute => sortedRoute.lineColor);
    // const frequencies = sortedRoute.map(sortedRoute => sortedRoute.frequency);
    const lineColorCodes = sortedRoute.map(sortedRoute => sortedRoute.lineColorCode);

    // const duration = legInfo.estimatedDuration ? timeInReadableFormat(legInfo.estimatedDuration) : undefined;
    // const metadata = frequencies?.[0] ? `Every ${Math.round(frequencies[0] / 60)} min` : undefined;
    const cost = legInfo.estimatedMinFare?.amount;
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(200)}
            style={tailwind.style('flex-1 pt-2')}
            accessibilityLabel={`Metro route from ${originStop?.name?.toLowerCase()} to ${destinationStop?.name?.toLowerCase()}, line color ${
                lineColors[0]
            }, fare ₹${cost}`}>
            <Animated.View style={tailwind.style('flex-row overflow-hidden')}>
                <Animated.View style={tailwind.style('flex-1')}>
                    <Animated.View
                        layout={LinearTransition.springify().damping(28).stiffness(200)}
                        style={tailwind.style(
                            'border-[1px] border-[#F1F2F7] rounded-[16px] p-[14px] pt-[11px] flex-1 w-full bg-white',
                        )}>
                        <Animated.Image
                            accessible={false}
                            source={mtIcMetroTransitReview}
                            style={tailwind.style(
                                `absolute bottom-${props.ticketId ? 16 : 10} left-0 w-[87px] h-[99px]`,
                            )}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                        />
                        <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                            <Animated.View style={tailwind.style('flex-row items-center')}>
                                <Animated.View
                                    style={tailwind.style(
                                        'h-7 w-7 items-center justify-center rounded-[10px]',
                                        `bg-[${getIconBGFromType('Metro')}]`,
                                    )}>
                                    <Icon
                                        style={tailwind.style('')}
                                        color="#1F2D3D"
                                        icon={<MetroIndicator fill={undefined} />}
                                        size={18}
                                    />
                                </Animated.View>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'ml-1 text-[15px] leading-[18px] font-areaNormal-extrabold  text-[#3B3A3C] px-1.5',
                                        )}>
                                        {userLanguageStrings.Metro}
                                    </Animated.Text>
                                    {lineColorCodes.map((_: unknown, index: number) => (
                                        <Animated.View style={tailwind.style('flex-row items-center')}>
                                            <Animated.Text
                                                numberOfLines={1}
                                                style={tailwind.style(
                                                    'text-[15px] leading-[18px] font-areaNormal-extrabold text-[#ABABAB] max-w-[110px]',
                                                )}>
                                                {index === 0 ? ' | ' : ''}
                                                {getUserLanguageStringsForMetroLine(
                                                    lineColors[index] ?? '',
                                                    userLanguageStrings,
                                                )}
                                            </Animated.Text>
                                            {index !== lineColorCodes?.length - 1 && (
                                                <Icon
                                                    icon={<ShuffleHorizontal />}
                                                    color="#ABABAB"
                                                    size={14}
                                                    style={tailwind.style('mx-1.5')}
                                                />
                                            )}
                                        </Animated.View>
                                    ))}
                                </Animated.View>
                            </Animated.View>
                            {cost && (
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[20px] leading-[22px] font-areaNormal-extrabold text-[#313131]',
                                    )}>
                                    <Animated.Text style={tailwind.style('text-[15px] font-inter-bold ')}>
                                        {' '}
                                        ₹{' '}
                                    </Animated.Text>
                                    {cost}
                                </Animated.Text>
                            )}
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
                        <Animated.View style={tailwind.style('flex-row justify-between items-end relative pt-[17px]')}>
                            <Animated.View style={tailwind.style('pl-[60px]')}>
                                <Animated.Text
                                    layout={LinearTransition.springify().damping(30).stiffness(200)}
                                    numberOfLines={1}
                                    style={tailwind.style(
                                        'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C] capitalize',
                                        `max-w-[${CONTAINER_SECTION - 72}px]`,
                                    )}>
                                    {originStop?.name}
                                </Animated.Text>
                                <Animated.View style={tailwind.style('flex-row items-center pt-2.5')}>
                                    <Icon color="#7B8997" icon={<TransitArrowRight fill={undefined} />} size={16} />
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C] pl-1 capitalize',
                                            `max-w-[${CONTAINER_SECTION - 90}px]`,
                                        )}>
                                        {destinationStop?.name}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                            {/* <Animated.View
                                entering={FadeIn.duration(200)}
                                style={tailwind.style('flex-1 items-end justify-end pb-0.5')}>
                                {cost ? (
                                    <TransitCost rupeeColor="#3B3A3C" numberColor="#3B3A3C" cost={cost} />
                                ) : (
                                    <ContentLoader height={48} width={'75%'}>
                                        <Rect x="0" y="0" rx="6" ry="6" width="100%" height="48" />
                                    </ContentLoader>
                                )}
                            </Animated.View> */}
                            <Animated.View style={tailwind.style('flex-row items-center')}></Animated.View>
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
                        <Animated.View style={tailwind.style('flex-row items-center justify-start mt-2')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#656565] font-areaNormal-extrabold text-lg text-[13px] leading-[22px]',
                                )}>
                                {userLanguageStrings.Take}
                            </Animated.Text>
                            <Animated.View
                                style={tailwind.style(
                                    `bg-[#${
                                        lineColorCodes[0]
                                    }] rounded-[4px] w-[15px] h-[14px] ml-1 flex items-center justify-center`,
                                )}>
                                <Animated.Text style={tailwind.style('text-white font-bold text-[8px] text-center')}>
                                    M
                                </Animated.Text>
                            </Animated.View>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#656565] font-areaNormal-extrabold text-lg text-[13px] leading-[22px]',
                                )}>
                                {' '}
                                {getUserLanguageStringsForMetroLine(lineColors[0] ?? '', userLanguageStrings)}{' '}
                                {userLanguageStrings.Line}
                            </Animated.Text>
                        </Animated.View>
                        {props.ticketId && (
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#656565] font-areaNormal-extrabold text-lg text-[13px] leading-[22px]',
                                )}>{`${userLanguageStrings.Ticket} ${userLanguageStrings.ID}: ${props.ticketId}`}</Animated.Text>
                        )}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
