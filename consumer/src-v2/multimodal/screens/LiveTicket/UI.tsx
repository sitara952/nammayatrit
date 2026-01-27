import { tailwind } from '../../../tailwind-theme/tailwind';
import React from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import TicketUI from '../Ticket/UI';
import { useConfigContext } from '@/typescript/context/ConfigContext';

import { LiveTicketFlowReturnType } from './Types';
import { TicketsFlow } from './Tickets/Flow';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { createAction } from '@/typescript/utils/common';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import { isUndefined } from 'lodash';

export const LiveTicketUI: React.FC<LiveTicketFlowReturnType> = React.memo(
    ({
        isLoading,
        onBookTicketPress,
        isButtonLoading,
        selectedTicket,
        selectedTicketProps,
        mpDispatch,
        liveTickets,
        pastTickets,
    }) => {
        const { top } = useSafeAreaInsets();
        const configManager = useConfigContext();
        const themeColors = configManager.get('themeColors');
        const userLanguageStrings = configManager.get('userLanguageStrings');

        return (
            <HardwareBackpressHandler>
                {liveTickets.length > 0 || pastTickets.length > 0 || selectedTicket ? (
                    <Animated.View style={tailwind.style(`flex-1 bg-[#F7F7F7] `)}>
                        {isLoading ? (
                            <View style={tailwind.style('flex-1 justify-center items-center')}>
                                <ActivityIndicator size="large" color={themeColors.Icon_neutralMidHigh} />
                            </View>
                        ) : (
                            <Animated.ScrollView
                                showsVerticalScrollIndicator={false}
                                style={tailwind.style('flex-1')}
                                contentContainerStyle={tailwind.style()}>
                                {Platform.OS === 'ios' && (
                                    <View
                                        style={{
                                            backgroundColor: '#282729',
                                            height: 300,
                                            position: 'absolute',
                                            top: -300,
                                            left: 0,
                                            right: 0,
                                        }}
                                    />
                                )}
                                {selectedTicket && (
                                    <Animated.View
                                        style={[
                                            tailwind.style(`px-4 flex-row justify-between items-center`),
                                            { paddingTop: top + 12 }, // Always apply padding for LiveTicket header
                                            { backgroundColor: '#282729' }, // Always apply background for LiveTicket header
                                        ]}>
                                        <View style={tailwind.style('flex-row items-center')}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    ' text-[18px] font-areaNormal-bold text-white leading-[30px] tracking-[0.24px]',
                                                )}
                                                accessibilityLabel={'Active Ticket'}>
                                                {selectedTicket.journeyStatus == 'CANCELLED'
                                                    ? ''
                                                    : `${userLanguageStrings.ActiveTicket}`}
                                            </Animated.Text>
                                        </View>
                                        <Pressable
                                            accessibilityLabel={`${'History button'} button`}
                                            accessibilityRole="button"
                                            testID="history-button"
                                            onPress={() => mpDispatch(createAction('NAVIGATE_TO_HISTORY', undefined))} // Dispatch action
                                            style={tailwind.style(
                                                'flex-row items-center bg-[#3C3C43] px-4 py-2 rounded-full',
                                            )}>
                                            <Typography
                                                type={'body-6'}
                                                style={tailwind.style('text-white font-areaNormal-bold')}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {userLanguageStrings.History}
                                            </Typography>
                                            <Svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={tailwind.style('ml-0.5')}>
                                                <Path d="M9 18l6-6-6-6" />
                                            </Svg>
                                        </Pressable>
                                    </Animated.View>
                                )}

                                {selectedTicket && selectedTicketProps ? (
                                    <Animated.View style={tailwind.style('flex-1 bg-[#F7F7F7] ')}>
                                        <TicketUI {...selectedTicketProps} />
                                    </Animated.View>
                                ) : null}
                                {isUndefined(selectedTicket) && (
                                    <TicketsFlow
                                        onLiveTicketPress={journey =>
                                            mpDispatch(createAction('GET_FULL_JOURNEY_SUMMARY', { journey }))
                                        }
                                        selectedTicketId={undefined}
                                        liveTickets={liveTickets}
                                        pastTickets={pastTickets}
                                        isTicketHistory={false}
                                        isLoadingPastTickets={false}
                                        isHelpAndSupportScreen={undefined}
                                    />
                                )}
                            </Animated.ScrollView>
                        )}
                    </Animated.View>
                ) : (
                    <Animated.View style={{ height: '100%', alignItems: 'center' }}>
                        <VideoPlayer
                            source={require('@/src-v2/assets/videos/mt_ic_empty_ticket_screen.mp4')}
                            resizeMode="cover"
                            shouldLoop={true}
                            style={tailwind.style('absolute inset-0 h-full w-full')}
                            containerStyle={undefined}
                            fallbackElement={undefined}
                            bufferingElement={undefined}
                            onVideoEnd={undefined}
                            autoPlay={undefined}
                            bufferConfig={undefined}
                            videoRef={undefined}
                            pauseVideo={undefined}
                            videoControls={undefined}
                            onStateChange={undefined}
                            onError={undefined}
                            onBuffer={undefined}
                            muted={undefined}
                            bufferingDelay={undefined}
                            enableNetworkOptimizations={undefined}
                            networkOptimizationConfig={undefined}
                            bufferingElementStyle={undefined}
                            enablePauseOnGesture={undefined}
                            showMuteControl={undefined}
                            muteControlStyle={undefined}
                            onGesturePress={undefined}
                            handleMuteToggle={undefined}
                            disableFocus={true}
                            ignoreSilentSwitch={'obey'}
                            preventsDisplaySleepDuringVideoPlayback={false}
                        />
                        <Typography
                            type={'callout-1'}
                            style={{
                                color: '#F5F5F5',
                                paddingVertical: 20,
                                lineHeight: 24,
                                textAlign: 'center',
                                width: SCREEN_WIDTH / 1.5,
                                fontSize: 22,
                                position: 'absolute',
                                bottom: 120,
                            }}
                            numberOfLines={2}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {isLoading
                                ? userLanguageStrings.CheckingForYourTickets
                                : userLanguageStrings.Youdonthaveanyactiveticketnow}
                        </Typography>
                        <Pressable
                            accessibilityLabel={'Book a ticket now button'}
                            accessibilityRole="button"
                            testID="ticket-placeholder-button"
                            onPress={onBookTicketPress}
                            style={tailwind.style(
                                `absolute bottom-[65px] w-[${SCREEN_WIDTH / 6}] min-h-[57px] bg-[${themeColors.Button_for_modes_bg}] py-10px px-30px justify-center items-center flex-row rounded-[22px]`,
                            )}>
                            {isLoading || isButtonLoading ? (
                                <ActivityIndicator size="small" color={themeColors.Button_for_modes_text} />
                            ) : (
                                <>
                                    <Animated.Text
                                        style={tailwind.style(
                                            `text-[16px] font-areaNormal-extrabold text-[${themeColors.Button_for_modes_text}] pl-3`,
                                        )}>
                                        {userLanguageStrings.Bookaticketannow}
                                    </Animated.Text>
                                </>
                            )}
                        </Pressable>
                    </Animated.View>
                )}
            </HardwareBackpressHandler>
        );
    },
);
