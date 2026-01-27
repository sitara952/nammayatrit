import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import icMyRideNotFound from '@/typescript/assets/ny-service/ic_my_ride_not_found.webp';
import Animated from 'react-native-reanimated';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { TicketData, TicketsViewState } from './Types';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import { TicketCardShimmer } from './components/TicketCardShimmer';
import { ticketStatusConfig, getMetroLineColorHex } from './TicketUtils.tsx';
import { Pressable } from '@/src-v2/primitives/Pressable.tsx';
import { getFormattedLocalDate } from '@/src-v2/utils/common.ts';

import Svg, { Rect, Path, G, Defs, ClipPath } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils.ts';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils.ts';
import { getTransitMetaInfoLabel } from '../../Ticket/TicketUtils/utils.ts';

function MetroIcon({ width = 16, height = 16 }) {
    return (
        <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
            <Rect width={18} height={18} rx={6} fill="#7E3878" />
            <Path
                d="M8.99707 4.59863C10.0151 4.59863 10.996 4.77953 11.9141 5.0918C12.1388 5.16672 12.2949 5.36668 12.3262 5.59766V5.60449C12.4323 6.37892 12.501 7.53455 12.501 8.82715C12.501 10.0386 12.4491 11.2622 12.3555 12.0303C12.318 12.3362 12.0494 12.5672 11.7373 12.5674H11.335L12.1133 13.3457H10.7891L10.0117 12.5674H7.98926L7.21094 13.3457H5.88672L6.66504 12.5674H6.28516C5.9729 12.5674 5.7035 12.3425 5.66602 12.0303C5.57235 11.2622 5.50002 10.0386 5.5 8.82715C5.5 7.53455 5.56866 6.37892 5.6748 5.60449C5.70602 5.3735 5.86845 5.17364 6.08691 5.09863C7.00488 4.78015 7.9792 4.59867 8.99707 4.59863ZM8.22266 10.5381C7.96674 10.5383 7.75488 10.7509 7.75488 11.0068C7.75513 11.2626 7.96689 11.4744 8.22266 11.4746H9.78418C10.0401 11.4746 10.2527 11.2627 10.2529 11.0068C10.2529 10.7508 10.0402 10.5381 9.78418 10.5381H8.22266ZM6.54297 6.42871C6.5055 6.42872 6.48047 6.46644 6.48047 6.50391C6.60537 7.47797 6.77435 8.20863 6.91797 8.68945C7.05542 9.16401 7.48031 9.49455 7.97363 9.51953C8.342 9.53826 8.75419 9.55762 9.00391 9.55762C9.25375 9.5576 9.66583 9.53826 10.0342 9.51953C10.5275 9.49453 10.9589 9.16408 11.1025 8.68945C11.2462 8.20863 11.4079 7.47794 11.5391 6.50391C11.5453 6.46643 11.514 6.42871 11.4766 6.42871H6.54297Z"
                fill="#F8F8F8"
            />
        </Svg>
    );
}

function BusIcon({ width = 16, height = 16 }) {
    return (
        <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
            <Rect width={18} height={18} rx={6} fill="#0088FF" />
            <G clipPath="url(#clip0_1425_7230)">
                <Path
                    d="M12.8055 7.5957V6.15195C12.8055 5.3707 12.193 4.72695 11.418 4.68945C10.7367 4.6582 9.88047 4.62695 9.00547 4.62695C8.13047 4.62695 7.26797 4.66445 6.58672 4.6957C5.81172 4.72695 5.19922 5.3707 5.19922 6.15195V7.5957C5.02422 7.5957 4.88672 7.7332 4.88672 7.9082V9.2707C4.88672 9.4457 5.02422 9.5832 5.19922 9.5832V12.8832C5.19922 13.1332 5.40547 13.3395 5.65547 13.3395H6.40547C6.65547 13.3395 6.86172 13.1332 6.86172 12.8832V12.2957H11.1367V12.8832C11.1367 13.1332 11.343 13.3395 11.593 13.3395H12.343C12.593 13.3395 12.7992 13.1332 12.7992 12.8832V9.58945C12.9742 9.58945 13.1117 9.45195 13.1117 9.27695V7.91445C13.1117 7.73945 12.9742 7.60195 12.7992 7.60195L12.8055 7.5957ZM7.76102 10.877C7.76102 10.9145 7.72977 10.9395 7.69852 10.9395H6.31727C6.27977 10.9395 6.25477 10.9082 6.25477 10.877V10.252C6.25477 10.2145 6.28602 10.1895 6.31727 10.1895H7.69852C7.73602 10.1895 7.76102 10.2207 7.76102 10.252V10.877ZM11.7543 10.877C11.7543 10.9145 11.723 10.9395 11.6918 10.9395H10.3168C10.2793 10.9395 10.2543 10.9082 10.2543 10.877V10.252C10.2543 10.2145 10.2855 10.1895 10.3168 10.1895H11.6918C11.7293 10.1895 11.7543 10.2207 11.7543 10.252V10.877ZM11.7543 8.85649C11.7543 8.90649 11.7168 8.94399 11.6668 8.94399H6.34227C6.29227 8.94399 6.25477 8.90649 6.25477 8.85649V6.31274C6.25477 6.26274 6.29227 6.22524 6.34227 6.22524L11.6605 6.22524C11.7105 6.22524 11.748 6.26274 11.748 6.31274V8.85649H11.7543Z"
                    fill="#F8F8F8"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_1425_7230">
                    <Rect width={10} height={10} fill="white" transform="translate(4 4.00098)" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}

const TicketCard: React.FC<
    TicketData & { onPress: (() => void) | undefined } & { appName: string } & {
        isHelpAndSupportScreen: boolean | undefined;
    }
> = ({
    from,
    to,
    fare,
    legIcons,
    status,
    route,
    serviceTier,
    legType,
    isSingleLeg,
    image,
    onPress,
    appName,
    createdAt,
    isHelpAndSupportScreen,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const statusInfo = ticketStatusConfig[status];

    const [date, time] = getFormattedLocalDate(createdAt);

    const getAccessibilityLabel = () => {
        const baseLabel = `Ticket from ${from.toLowerCase()} to ${to.toLowerCase()}. Fare ₹${fare}.`;

        const modeLabel = isSingleLeg
            ? (() => {
                  if (legType === 'Metro' && serviceTier) {
                      const lines = serviceTier
                          .split(',')
                          .map(c => c.trim().split(' ')[0])
                          .filter(Boolean)
                          .join(', ');
                      return `Mode: Metro. Metro line${lines.includes(',') ? 's' : ''}: ${lines}.`;
                  } else if (['Bus', 'Subway'].includes(legType) && serviceTier) {
                      return `Mode: ${route} ${legType}. Service Tier: ${serviceTier}.`;
                  } else {
                      return `Mode: ${legType}.`;
                  }
              })()
            : legIcons.length > 0
              ? `Multi-modal journey using ${legIcons.length} transit mode${legIcons.length > 1 ? 's' : ''}.`
              : '';

        const statusLabel = statusInfo?.label ? `Status: ${statusInfo.label}.` : '';

        const fullLabel = [baseLabel, modeLabel, statusLabel].filter(Boolean).join(' ');
        return fullLabel;
    };

    return (
        <Animated.View style={tailwind.style('px-3 pt-3 pb-3')}>
            <View style={tailwind.style('overflow-hidden')}>
                {(status === 'expired' || status === 'failed') && !isHelpAndSupportScreen && (
                    <View
                        pointerEvents="none"
                        style={tailwind.style('absolute inset-0 bg-white opacity-50 z-30 rounded-2xl')}
                    />
                )}
                <Pressable
                    accessibilityRole="button"
                    testID={`ticket-card`}
                    onPress={status === 'live' || isHelpAndSupportScreen ? onPress : undefined}
                    accessible={true}
                    accessibilityLabel={getAccessibilityLabel()}>
                    <View style={tailwind.style('border border-[#F1F2F7] rounded-2xl bg-white')}>
                        <View style={tailwind.style('p-4 pt-4 flex-row')}>
                            <Image
                                accessible={true}
                                accessibilityLabel="ticket image"
                                source={image}
                                style={tailwind.style(
                                    `w-[87px] h-[99px] absolute bottom-0 left-0 z-10 ${
                                        !isSingleLeg && 'ml-[-45] w-[120px] h-[80px]'
                                    }`,
                                )}
                            />
                            <View style={tailwind.style('flex-1 pl-[60px] mr-1')}>
                                {appName !== 'anna' && (legType === 'Metro' || legType === 'Bus') && (
                                    <View style={tailwind.style('flex-row items-center mb-1')}>
                                        {legType === 'Metro' ? (
                                            <MetroIcon width={16} height={16} />
                                        ) : (
                                            <BusIcon width={16} height={16} />
                                        )}
                                        <View
                                            style={tailwind.style(
                                                `px-[4px] py-1 rounded-md ${legType === 'Metro' ? '' : 'bg-[#FFF7D6]'}`,
                                            )}>
                                            <Text
                                                style={tailwind.style(
                                                    `text-[10px] font-areaNormal-semibold ${
                                                        legType === 'Metro' ? 'text-[13px]  ' : 'text-[#FFA500]'
                                                    }`,
                                                )}>
                                                {getUserLanguageStringsForMode(
                                                    legType,
                                                    userLanguageStrings,
                                                ).toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                <Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#8B8B8B]')}>
                                    {from}
                                </Text>
                                <View style={tailwind.style('flex-row items-center pt-1')}>
                                    <Icon icon={<TransitArrowRight />} size={14} style={tailwind.style('mt-1')} />
                                    <Text
                                        style={tailwind.style(
                                            'text-[14px] font-areaNormal-extrabold text-[#232323] pl-1 mr-1',
                                        )}>
                                        {to}
                                    </Text>
                                </View>
                            </View>
                            <View style={tailwind.style('flex-row items-end justify-end')}>
                                <Text
                                    style={tailwind.style(
                                        'text-[16px] font-inter font-500 text-[#232323] mb-1 mr-0.5',
                                    )}>
                                    ₹
                                </Text>
                                <Text style={tailwind.style('text-[28px] font-inter font-500 text-[#232323]')}>
                                    {fare}
                                </Text>
                            </View>
                        </View>
                        <View style={tailwind.style('mb-2')}>
                            <Divider
                                type="dashed"
                                direction="horizontal"
                                style={tailwind.style('px-3')}
                                strokeDashArray="8 5"
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                                dividerColor={undefined}
                            />
                        </View>
                        <View style={tailwind.style('flex-row items-center justify-between px-4 pb-2')}>
                            <View style={tailwind.style('flex-row items-center')}>
                                <Text
                                    style={tailwind.style(
                                        'text-center text-[#5B6777] text-[13px]  font-areaNormal-bold',
                                    )}>
                                    {date ?? ''}
                                </Text>
                                <Text style={tailwind.style('text-gray-300 text-[20px] text-center px-1')}>{'•'}</Text>
                                <Text
                                    style={tailwind.style(
                                        'text-center text-[#5B6777] text-[13px]  font-areaNormal-bold',
                                    )}>
                                    {time ?? ''}
                                </Text>
                            </View>

                            <View style={tailwind.style('flex-row items-center hidden')}>
                                {legIcons.map((icon, idx) => (
                                    <React.Fragment key={idx}>
                                        {icon}
                                        {legIcons.length > 1 && idx < legIcons.length - 1 && (
                                            <Text
                                                style={tailwind.style(
                                                    'text-[15px] font-areaNormal font-500 text-[#8B8B8B] px-1',
                                                )}>
                                                +
                                            </Text>
                                        )}
                                    </React.Fragment>
                                ))}
                                {isSingleLeg && (
                                    <>
                                        <Text
                                            style={tailwind.style(
                                                'text-[15px] font-areaNormal font-500 text-[#8B8B8B] pl-2',
                                            )}>
                                            {route}
                                        </Text>
                                        {legType === 'Metro' && serviceTier ? (
                                            <View style={tailwind.style('flex-row items-center')}>
                                                {(serviceTier || '').split(',').map((color, idx) => (
                                                    <React.Fragment key={color.trim() + idx}>
                                                        <View
                                                            style={[
                                                                tailwind.style(
                                                                    'rounded-[4px] w-[16px] h-[16px] ml-2 mr-1 flex items-center justify-center',
                                                                ),
                                                                {
                                                                    backgroundColor: getMetroLineColorHex(
                                                                        (
                                                                            color?.trim().split(' ')[0] ||
                                                                            color?.trim() ||
                                                                            ''
                                                                        ).toLowerCase(),
                                                                    ),
                                                                },
                                                            ]}>
                                                            <Text
                                                                style={tailwind.style(
                                                                    'text-white font-bold font-areaNormal text-[10px] text-center',
                                                                )}>
                                                                M
                                                            </Text>
                                                        </View>
                                                        <Text
                                                            style={tailwind.style(
                                                                'text-[15px] font-areaNormal font-500 text-[#8B8B8B]',
                                                            )}>
                                                            {getUserLanguageStringsForMetroLine(
                                                                color?.trim().split(' ')[0] || color.trim(),
                                                                userLanguageStrings,
                                                            )}
                                                        </Text>
                                                    </React.Fragment>
                                                ))}
                                                <Text
                                                    style={tailwind.style(
                                                        'text-[15px] font-areaNormal font-500 text-[#8B8B8B] ml-1',
                                                    )}>
                                                    {(serviceTier || '').split(',').length > 1
                                                        ? userLanguageStrings.Lines
                                                        : userLanguageStrings.Line}
                                                    {` ${userLanguageStrings.Metro}`}
                                                </Text>
                                            </View>
                                        ) : (
                                            ['Bus', 'Subway'].includes(legType) && (
                                                <Text
                                                    style={tailwind.style(
                                                        'text-[15px] font-areaNormal font-500 text-[#8B8B8B] pl-1',
                                                    )}>
                                                    {getTransitMetaInfoLabel(serviceTier, userLanguageStrings)}{' '}
                                                    {legType === 'Subway'
                                                        ? userLanguageStrings.Train
                                                        : getUserLanguageStringsForMode(legType, userLanguageStrings)}
                                                </Text>
                                            )
                                        )}
                                    </>
                                )}
                            </View>
                            <View style={tailwind.style('flex-row items-center')}>
                                {status != 'live' && statusInfo && (
                                    <View
                                        style={tailwind.style(
                                            `rounded-xl border border-red-100 bg-[${statusInfo.color}]`,
                                        )}>
                                        <Text
                                            style={tailwind.style(
                                                `text-[12px] font-areaNormal-bold p-1 px-2 ${statusInfo.textClass}`,
                                            )}>
                                            {statusInfo.label === 'Expired'
                                                ? userLanguageStrings.Expired
                                                : statusInfo.label === 'Cancelled'
                                                  ? userLanguageStrings.Cancelled
                                                  : statusInfo.label === 'Failed'
                                                    ? userLanguageStrings.Failed
                                                    : statusInfo.label}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Pressable>
            </View>
        </Animated.View>
    );
};

export const TicketsListView: React.FC<TicketsViewState> = ({
    liveTickets,
    pastTickets,
    onLiveTicketPress,
    selectedTicketId,
    appName,
    isTicketHistory,
    isLoadingPastTickets,
    isHelpAndSupportScreen,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View style={tailwind.style(`flex-1 pb-10 ${isTicketHistory ? '' : 'pt-10'} `)}>
            {!isTicketHistory && liveTickets.length > 1 && (
                <Animated.Text
                    style={tailwind.style('text-[18px] font-areaNormal font-600 text-[#656565] py-3 text-center')}>
                    {userLanguageStrings.LiveTickets}
                </Animated.Text>
            )}

            {!isLoadingPastTickets && liveTickets.length === 0 && pastTickets.length === 0 && (
                <Animated.View style={noTicketsContainerStyles.container}>
                    <Animated.View style={noTicketsContainerStyles.errorContainer}>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="my ride not found image"
                            source={icMyRideNotFound}
                            resizeMode="contain"
                            style={noTicketsContainerStyles.image}
                        />
                    </Animated.View>
                    <Typography
                        type="subhead-1"
                        style={noTicketsContainerStyles.subhead}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={
                            isHelpAndSupportScreen
                                ? 'No recent tickets available for this issue'
                                : 'No ticket history available'
                        }
                        accessibilityRole={undefined}>
                        {isHelpAndSupportScreen
                            ? userLanguageStrings.NoRecentTicketsAvailableForThisIssue
                            : userLanguageStrings.NoTicketsYet}
                    </Typography>
                </Animated.View>
            )}
            <View
                accessible={true}
                accessibilityLabel={`You have ${liveTickets.length} active ticket${
                    liveTickets.length !== 1 ? 's' : ''
                }.`}>
                {liveTickets.map(
                    ticket =>
                        selectedTicketId !== ticket.id && (
                            <TicketCard
                                key={ticket.id}
                                {...ticket}
                                onPress={() => {
                                    console.info('log...');
                                    onLiveTicketPress(ticket.journeyInfoResp, ticket.id);
                                }}
                                appName={appName}
                                isHelpAndSupportScreen={isHelpAndSupportScreen}
                            />
                        ),
                )}
            </View>

            {(isLoadingPastTickets || pastTickets.length > 0) && !isHelpAndSupportScreen ? (
                <Animated.Text
                    style={tailwind.style('text-[18px] font-areaNormal font-600 text-[#656565] py-3 text-center')}>
                    {userLanguageStrings.PastTickets}
                </Animated.Text>
            ) : null}

            <View
                accessible={true}
                accessibilityLabel={`You have ${pastTickets.length} past ticket${
                    pastTickets.length !== 1 ? 's' : ''
                }.`}>
                {isLoadingPastTickets
                    ? Array.from({ length: 3 }).map((_, index) => <TicketCardShimmer key={index} />)
                    : pastTickets.map(ticket => (
                          <TicketCard
                              key={ticket.id}
                              {...ticket}
                              onPress={() => {
                                  onLiveTicketPress(ticket.journeyInfoResp, ticket.id);
                              }}
                              appName={appName}
                              isHelpAndSupportScreen={isHelpAndSupportScreen}
                          />
                      ))}
            </View>
        </Animated.View>
    );
};

const noTicketsContainerStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginBottom: 50,
    },
    errorContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        height: 192,
        width: 144,
    },
    subhead: {
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
        marginHorizontal: 16,
        lineHeight: 24,
    },
});
