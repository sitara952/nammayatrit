import React, { useCallback, useState, useRef } from 'react';
import { View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { JourneyId } from '../../../../src/typescript/state/client/user';
import Header from './Components/Header';
import AnimatedTimer from './Components/AnimatedTimer';
import { LinearTransition, FadeOut, FadeIn } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { TransitInfoCard } from './SingleTicket/components/TransitInfoCard/TransitInfoCard';
import { TransitInfoCardProps } from './SingleTicket/types';
import SuburbanInfoCard, { SuburbanInfoCardProps } from './SingleTicket/components/SuburbanInfoCard';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useShowUTSTicket } from '@/src-v2/hooks/useShowUTSTicket';
import { getShowTicketRequest } from '../../utils/SubwayUtils';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import Svg, { Line } from 'react-native-svg';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import AnimatedInfo from './SingleTicket/components/AnimatedInfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { extractCategories } from '../../utils/journeyTrackingUtils';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';
import { getCategoryDisplayName } from '../JourneyInfoScreen/components/CategorySelector';

export interface TicketDetailsPopUpProps {
    // Core ticket information
    transitInfoCardProps: TransitInfoCardProps | SuburbanInfoCardProps;
    source: string;
    sourceTamil: string;
    destination: string;
    destinationTamil: string;
    duration: string | undefined;
    journeyId: JourneyId | null;
    onStartJourney: () => void;
    mode: 'BUS' | 'METRO' | 'SUBWAY';
    legInfo: legInfo | undefined;
}

const TicketDetailsPopUp = ({
    ticketData,
    onDismissBusTicket,
}: {
    ticketData: TicketDetailsPopUpProps | null;
    onDismissBusTicket: () => void;
}) => {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');
    const { showTicket } = useShowUTSTicket({ journeyId: ticketData?.journeyId || null });
    const isFocus = useIsFocused();
    const [isLoadingUTSTicket, setIsLoadingUTSTicket] = useState(false);
    const isShowingTicketRef = useRef(false);
    const { handlers, animatedStyle } = useScaleAnimation();

    const handleShowUTSTicket = useCallback(async () => {
        if (isShowingTicketRef.current) return;
        if (ticketData?.legInfo) {
            isShowingTicketRef.current = true;
            setIsLoadingUTSTicket(true);
            const showTickeRequest = getShowTicketRequest(ticketData.legInfo);
            await showTicket(showTickeRequest);
            setIsLoadingUTSTicket(false);
            isShowingTicketRef.current = false;
        }
    }, [ticketData?.legInfo, showTicket]);

    if (!ticketData) {
        return null;
    }
    const categories = ticketData?.legInfo ? extractCategories(ticketData?.legInfo) : [];
    // Helper function to check if the props are for SuburbanInfoCard
    const isSuburbanInfoCard = (
        props: TransitInfoCardProps | SuburbanInfoCardProps,
    ): props is SuburbanInfoCardProps => {
        return 'trainType' in props;
    };

    const commencingHours =
        ticketData?.legInfo?.legExtraInfo?.TAG === 'Subway'
            ? (ticketData?.legInfo?.legExtraInfo?._0?.ticketValidityHours?.at(0) ?? 1)
            : 1;
    const commencingHoursStr = commencingHours < 10 ? `0${commencingHours}` : `${commencingHours}`;

    return (
        <View
            style={tailwind` ${ticketData.mode === 'SUBWAY' ? 'bg-white' : 'bg-[#FBFBFB]'} rounded-[32px] pb-[${bottom}px]`}>
            <Header onClose={onDismissBusTicket} mode={ticketData.mode} />
            <Animated.ScrollView
                contentContainerStyle={tailwind`pb-4 px-4`}
                layout={LinearTransition.springify().damping(30).stiffness(200)}>
                {isSuburbanInfoCard(ticketData.transitInfoCardProps) ? (
                    <>
                        <SuburbanInfoCard {...ticketData.transitInfoCardProps} />
                        {ticketData.mode === 'SUBWAY' && (
                            <>
                                <Animated.View
                                    entering={FadeIn}
                                    exiting={FadeOut}
                                    layout={LinearTransition.springify()}
                                    style={tailwind.style(
                                        'bg-[#FBFBFB] mt-[31px] w-[82%] h-[100px] rounded-[32px] mx-auto overflow-hidden',
                                    )}>
                                    <AnimatedInfo
                                        subInfo={userLanguageStrings.JourneyShouldCommenceWithin}
                                        mainInfo={`${commencingHoursStr}:00${userLanguageStrings.Hour}`}
                                    />
                                </Animated.View>
                                <Pressable
                                    accessibilityRole="button"
                                    testID={`show-ticket-press-suburban`}
                                    accessibilityLabel="Show original train ticket button"
                                    onPress={handleShowUTSTicket}
                                    disabled={isLoadingUTSTicket}
                                    {...handlers}
                                    style={tailwind.style(`pt-[20px] px-[20px]`)}>
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                `bg-[#047AEA] w-full h-[57px] w-full justify-center items-center flex-row rounded-[16px] gap-[8px]`,
                                            ),
                                            animatedStyle,
                                        ]}>
                                        {isLoadingUTSTicket ? (
                                            <LottieWithFallback
                                                fallback={undefined}
                                                style={tailwind.style('w-[40px] h-[50px] m-auto')}
                                                source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                                                autoPlay
                                                loop
                                            />
                                        ) : (
                                            <Animated.Text
                                                style={tailwind.style(
                                                    `text-[15px] font-areaNormal-extrabold text-[${colors.Button_for_modes_text}]`,
                                                )}>
                                                {userLanguageStrings.ShowOriginalTrainTicket}
                                            </Animated.Text>
                                        )}
                                    </Animated.View>
                                </Pressable>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <TransitInfoCard {...ticketData.transitInfoCardProps} />
                        <Animated.View entering={FadeIn} style={tailwind.style('my-6')}>
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
                        {categories.map((category: categoryInfoResponse) => {
                            if (!category.categorySelectedQuantity || category.categorySelectedQuantity === 0)
                                return null;
                            return (
                                <View style={tailwind`mt-4 flex-row justify-between`}>
                                    <Animated.Text style={tailwind`text-[13px] font-bold text-[#3B3A3C]`}>
                                        {getCategoryDisplayName(category.categoryName)}
                                    </Animated.Text>
                                    <Animated.Text style={tailwind`text-[13px] font-bold text-[#3B3A3C]`}>
                                        {category.categorySelectedQuantity}
                                    </Animated.Text>
                                </View>
                            );
                        })}
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            layout={LinearTransition}
                            style={tailwind.style('w-[100%] h-[100px] rounded-[32px] mx-auto my-6 overflow-hidden')}>
                            {isFocus && (
                                <AnimatedTimer
                                    duration={ticketData.duration}
                                    journeyId={ticketData.journeyId}
                                    modes={undefined}
                                    busTicketNotActivated={false}
                                />
                            )}
                        </Animated.View>
                    </>
                )}
            </Animated.ScrollView>
        </View>
    );
};

export default TicketDetailsPopUp;
