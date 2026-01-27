import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { peopleCategory, QrCodeViewProps, TicketContentProps } from '../PaymentStatusScreen/Types';
import { ticketBookingServiceDetails } from '@/readOnly/api/types/TicketBookingServiceDetails.gen';
import Svg, { Circle, Path, Rect, Text } from 'react-native-svg';
import { View, Image, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { Icon } from '@/typescript/components/Icon';
import TicketsIcon from '@/src-v2/multimodal/components/svg/Tickets';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import locationIcon from '@/typescript/assets/ticketing/ys_location_pin_icon.webp';
import boatingIcon from '../../../../../consumer/android/app/src/odishaYatri/res/drawable/ic_boating_icon.webp';
import boatingGreyIcon from '../../../../../consumer/android/app/src/odishaYatri/res/drawable/ic_boating_grey_icon.webp';
import boatingBlackIcon from '../../../../../consumer/android/app/src/odishaYatri/res/drawable/ic_boating_black_icon.webp';
import personIcon from '@/typescript/assets/ticketing/ys_black_person.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Button from '@/src-v2/primitives/Button';
import chevronLeft from '../../../../ios/Common/Images/ny_ic_chevron_left.png';
import chevronRight from '../../../../ios/Common/Images/ny_ic_chevron_right.png';
import bluredQRImage from '@/typescript/assets/ticketing/ys_bluredQR.webp';
import {
    BottomSheetStage,
    selectAppConfig,
    setBottomSheetStage,
    updateSelectedSearchedStop,
} from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { safe } from '@/typescript/utils/common';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { default as FallbackQRCode } from 'react-native-qrcode-svg';
import { convertUTCtoIST } from '@/src-v2/utils/common';
import { convertUTCTimeToISTTimeinHHMMSS, formatDateWithDay } from './ticketingHelper';
import { ServiceStatus_serviceStatus } from '@/readOnly/api/types/Enums.gen';
import AnimatedLinearGradient from '@/src-v2/multimodal/screens/Ticket/Components/AnimatedLinearGradient';

const DashedLine: React.FC = React.memo(() => {
    return (
        <View style={styles.dashedLineContainer}>
            {Array.from({ length: 20 }).map((_, index) => (
                <View key={index} style={[styles.dashDot, { backgroundColor: '#F5F5F5' }]} />
            ))}
        </View>
    );
});

const AnimatedTimer: React.FC<{ expireDate: string }> = React.memo(({ expireDate }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = ['#DFEDE2', '#CFE8D0', '#A5DBA3', '#8ED18B', '#A5DBA3', '#CFE8D0', '#DFEDE2'];
    const date = new Date(expireDate);
    const expireTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <AnimatedLinearGradient
            points={{ start: { x: 1, y: 1 }, end: { x: -1, y: -1 } }}
            customColors={colors}
            speed={320}
            style={tailwind.style('rounded-[24px] items-center flex-row w-[20px]')}>
            <Animated.Text
                style={tailwind.style(
                    `text-[#454C55] text-[14px] leading-[12px] text-center pt-5 font-areaNormal-extrabold`,
                )}>
                {userLanguageStrings.TicketisValidTillOn(expireTime)}
            </Animated.Text>
            <Animated.Text
                style={tailwind.style(
                    `text-[32px] text-[#14171F] text-center pt-2 leading-[40px] font-departureMono-regular`,
                )}>
                {formatDateWithDay(expireDate)}
            </Animated.Text>
        </AnimatedLinearGradient>
    );
});

const StatusBadge: React.FC<{ status: ServiceStatus_serviceStatus | undefined; isExpired: boolean }> = ({
    status,
    isExpired,
}) => {
    const getStatusBadgeStyle = useCallback((status?: ServiceStatus_serviceStatus) => {
        switch (status) {
            case 'Cancelled':
                return '#EA4848';
            case 'Pending':
                return '#F8BC17';
            case 'Failed':
                return '#EA4848';
            default:
                return '#016ACD';
        }
    }, []);
    const backgroundColor = getStatusBadgeStyle(status);
    const textWidth = status ? status.length * 10 + 20 : 90;

    return (
        <Svg width={textWidth} height={24} viewBox={`0 0 ${textWidth} 28`} fill="none">
            <Rect width={textWidth} height={24} rx={14} fill={backgroundColor} />
            <Text
                x={textWidth / 2}
                y={17}
                fontSize={14}
                fontWeight="700"
                fill={status === 'Pending' ? '#262B30' : '#FFFFFF'}
                textAnchor="middle"
                fontFamily="DepartureMono-Regular">
                {isExpired ? 'EXPIRED' : status ? status.toUpperCase() : ''}
            </Text>
        </Svg>
    );
};

const BluredQrView: React.FC<{ status: ServiceStatus_serviceStatus | undefined; isExpired: boolean }> = React.memo(
    ({ status, isExpired }) => {
        return (
            <View style={{ width: 180, height: 180, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    accessible={true}
                    accessibilityLabel="blured QR image"
                    source={bluredQRImage}
                    style={{ position: 'absolute', width: 180, height: 180 }}
                />
                <StatusBadge status={status} isExpired={isExpired} />
            </View>
        );
    },
);

export const QrCodeView = React.memo(({ jsonString, size = 171, status, isTicketExpired }: QrCodeViewProps) => {
    const appConfig = useAppSelector(selectAppConfig);
    if (!jsonString || jsonString.trim() === '') {
        return (
            <Animated.View
                style={[tailwind.style(`flex-row flex-wrap justify-center align-center w-[${size}px] h-[${size}px] `)]}>
                <Animated.Text style={tailwind.style('text-gray-500 text-center')}>QR Code not available</Animated.Text>
            </Animated.View>
        );
    }
    return (
        <>
            <Animated.View
                style={[tailwind.style(`flex-row flex-wrap justify-center align-center w-[${size}px] h-[${size}px]`)]}>
                {isTicketExpired ? (
                    <BluredQrView status={undefined} isExpired={true} />
                ) : status === 'Confirmed' ? (
                    <FallbackQRCode
                        value={jsonString}
                        size={size}
                        logoSize={30}
                        logoMargin={1}
                        logoBackgroundColor={'white'}
                        logoBorderRadius={8}
                        logo={{ uri: appConfig.screenConfig.eventScreenConfig.transparentBgLogo }}
                    />
                ) : (
                    <BluredQrView status={status} isExpired={false} />
                )}
            </Animated.View>
        </>
    );
});

const TicketDetails: React.FC<{
    ticketServiceName: string;
    visitedDate: string;
    totalTickets: string;
    index: number;
    totalServices: number;
    isBoatingTicket: boolean | undefined;
}> = React.memo(({ ticketServiceName, visitedDate, totalTickets, index, totalServices, isBoatingTicket }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={[tailwind.style('mx-[24px] mt-[23px] flex-row')]}>
            <Animated.View style={[tailwind.style('flex-col'), { flex: 1 }]}>
                <Animated.Text style={[tailwind.style('text-[#2D2D2E] text-[17px] pb-1 '), { fontWeight: 600 }]}>
                    {`${userLanguageStrings.Ticketsfor} ${ticketServiceName}`}
                </Animated.Text>

                <Animated.View style={tailwind.style('flex-row items-center')}>
                    <Animated.Text style={[tailwind.style('text-[#737373] text-[15px]'), { fontWeight: 400 }]}>
                        {`${visitedDate}   |   `}
                    </Animated.Text>
                    <Image
                        accessible={true}
                        accessibilityLabel="location icon"
                        source={isBoatingTicket ? boatingGreyIcon : personIcon}
                        style={{ width: 13, height: 13 }}
                    />
                    <Animated.Text style={[tailwind.style('text-[#737373] text-[15px]'), { fontWeight: 400 }]}>
                        {`  X ${totalTickets}`}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>
            <Animated.View
                style={{
                    backgroundColor: '#F1F2F7',
                    borderRadius: 15,
                    height: 28,
                    width: 52,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Animated.Text style={[tailwind.style('text-[#2D2D2E] text-[15px] '), { fontWeight: 500 }]}>
                    {`${index + 1}/${totalServices}`}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
});

const PassengerCountDisplay: React.FC<{ breakdown: peopleCategory[]; isBoatingTicket: boolean | undefined }> =
    React.memo(({ breakdown, isBoatingTicket }) => {
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');
        if (!breakdown || breakdown.length === 0) return null;

        return (
            <View style={styles.passengerCountContainer}>
                {breakdown.map((item, index) => (
                    <React.Fragment key={`passenger-${index}`}>
                        <View style={styles.passengerItem}>
                            <Image
                                accessible={true}
                                accessibilityLabel="passenger icon"
                                source={isBoatingTicket ? boatingBlackIcon : personIcon}
                                style={styles.passengerIcon}
                            />
                            <Animated.Text style={styles.passengerText}>
                                {isBoatingTicket ? userLanguageStrings.NoOf : ''} {item.name}{' '}
                                {String(item.count).padStart(2, '0')}
                            </Animated.Text>
                        </View>
                        {index < breakdown.length - 1 && <View style={styles.separator} />}
                    </React.Fragment>
                ))}
            </View>
        );
    });

const CardDetails: React.FC<{
    item: ticketBookingServiceDetails;
    expiryDate: string;
    index: number;
    isTicketLive: boolean;
    placeName: string;
    latitude: number | undefined;
    longitude: number | undefined;
    isBoatingTicket: boolean | undefined;
}> = React.memo(({ item, expiryDate, index, placeName, latitude, longitude, isTicketLive, isBoatingTicket }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const notes = useMemo(() => {
        const formattedNotes =
            item.noteInfo
                ?.split('\n')
                .map((note: string) => note.trim())
                .filter(Boolean) || [];
        return formattedNotes.length > 0 ? formattedNotes : [];
    }, [item.noteInfo]);

    useEffect(() => {
        const getAsyncSourceLocation = async () => {
            const data = await safe(
                GetLocationAndServiceability.getLocationObjectAndServiceability(
                    {
                        TAG: 'PlaceByLatLon',
                        _0: {
                            contents: {
                                lat: latitude || 0,
                                lon: longitude || 0,
                            },
                            tag: '',
                        },
                    },
                    undefined,
                    undefined,
                    undefined,
                    'source',
                ),
            );
            return data.result?.location;
        };
        getAsyncSourceLocation().then(destination => {
            dispatch(updateSelectedSearchedStop(destination ?? null));
        });
    }, [latitude, longitude]);

    return (
        <Animated.View style={tailwind.style(' w-[88%] mx-6 rounded-[20px] mt-6 border-[1px] border-[#F1F2F7] pb-4')}>
            <Animated.View style={tailwind.style('flex-row justify-between items-center p-4 pb-2 rounded-t-[20px]')}>
                <Image
                    accessible={true}
                    accessibilityLabel="location icon"
                    source={isBoatingTicket ? boatingIcon : locationIcon}
                    style={styles.detailIcon}
                />
                <Animated.Text
                    style={{
                        color: '#5B6777',
                        fontSize: 16,
                        fontWeight: '600',
                        flex: 1,
                    }}>
                    {item.ticketServiceName}
                </Animated.Text>
                <Animated.Text style={{ color: '#454C55', fontSize: 17, fontWeight: '700' }}>
                    ₹{item.amount}
                </Animated.Text>
            </Animated.View>
            <DashedLine />

            <Animated.View style={tailwind.style('pt-4 px-3')}>
                <Animated.View style={tailwind.style('flex-col justify-between mb-4')}>
                    <Animated.View style={{ flexDirection: 'row' }}>
                        <Animated.View style={{ flex: 1 }}>
                            <Animated.Text style={styles.cardTitle}>{userLanguageStrings.Date}</Animated.Text>
                            <Animated.Text style={styles.cardContent}>
                                {item.expiryDate ? expiryDate : ''}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View>
                            <Animated.Text style={styles.cardTitle}>{userLanguageStrings.ServiceID}</Animated.Text>
                            <Animated.Text style={styles.cardContent}>{item.ticketServiceShortId}</Animated.Text>
                        </Animated.View>
                    </Animated.View>
                    {notes.length > 0 && (
                        <Animated.View style={{ flexDirection: 'row' }}>
                            <Animated.View style={{ flex: 1 }}>
                                <Animated.Text style={[styles.cardTitle, { marginTop: 16 }]}>{'Note'}</Animated.Text>
                                {notes.map((note: string, noteIndex: number) => (
                                    <Animated.View
                                        key={`ticket-note-${noteIndex}`}
                                        style={{ flexDirection: 'row', marginTop: 2 }}>
                                        <Animated.Text style={[styles.cardContent, { fontSize: 5, marginTop: 10 }]}>
                                            ●
                                        </Animated.Text>
                                        <Animated.Text style={[styles.cardContent, { marginLeft: 5, fontSize: 14 }]}>
                                            {note}
                                        </Animated.Text>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        </Animated.View>
                    )}
                </Animated.View>
            </Animated.View>

            {isTicketLive && (
                <Button
                    testID={`book_ride_to_eventplace_${index}`}
                    type="primary"
                    text={`${userLanguageStrings.BookRideto} ${placeName}`}
                    style={{
                        borderRadius: 10,
                        justifyContent: 'center',
                        marginTop: 1,
                        marginHorizontal: 14,
                    }}
                    onPress={() => {
                        dispatch(
                            setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'searchForRides_dest' }),
                        );
                        navigation.navigate(
                            'mainTabNavigation',
                            {
                                screen: 'homeTab_homeScreen',
                            },
                            { pop: true },
                        );
                    }}
                />
            )}
        </Animated.View>
    );
});

const TicketContent: React.FC<TicketContentProps> = ({ ticketDetails }) => {
    const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const visitedDate = ticketDetails?.visitDate.replace(/-/g, '/') || '';
    const today = new Date().toISOString().split('T')[0];
    const currentTime = convertUTCtoIST(new Date().toISOString(), 'HH:mm:ss');
    const isFocus = useIsFocused();

    const getPropleCategory = useCallback((service: ticketBookingServiceDetails) => {
        return (
            service.categories?.flatMap(
                category =>
                    category.peopleCategories
                        ?.filter(peopleCategory => (peopleCategory.numberOfUnits || 0) > 0)
                        .map(peopleCategory => ({
                            name: peopleCategory.name,
                            count: peopleCategory.numberOfUnits || 0,
                        })) || [],
            ) || []
        );
    }, []);
    const calculateTotalTicketsAndBreakdown = useCallback((services: ticketBookingServiceDetails[]) => {
        if (!services || services.length === 0) return { total: 0, breakdown: [] };
        const result: peopleCategory[] = services.flatMap(service => getPropleCategory(service));
        const total = result.reduce((sum, item) => sum + item.count, 0);
        return { total };
    }, []);

    const { total: totalTickets } = useMemo(
        () => calculateTotalTicketsAndBreakdown(ticketDetails?.services || []),
        [calculateTotalTicketsAndBreakdown, ticketDetails?.services],
    );

    const LiveSvg = useCallback(() => {
        return (
            <Svg width={65} height={25} viewBox="0 0 63 19" fill="none">
                <Rect width={63} height={19} rx={9.5} fill="#258834" />
                <Circle cx={13} cy={9.5} r={3} fill="#fff" />
                <Path
                    d="M22.51 5.273h1.09v7.636h4.364V14H22.51V5.273zm10.022 7.636V6.364H30.35V5.273h5.455v1.09h-2.182v6.546h2.182V14H30.35v-1.09h2.182zm7.84 0h-1.09v-2.182h1.09v2.182zm0 0h1.092V14h-1.091v-1.09zm-2.181-7.636h1.09v5.454h-1.09V5.273zm4.363 0h1.091v5.454h-1.09V5.273zm-1.09 5.454h1.09v2.182h-1.09v-2.182zm4.568-5.454h5.454v1.09h-4.364v2.182h3.273v1.091h-3.273v3.273h4.364V14h-5.454V5.273z"
                    fill="#fff"
                />
            </Svg>
        );
    }, []);

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(offsetX / (SCREEN_WIDTH - 32));
        scrollViewRef.current?.scrollTo({
            x: currentIndex * (SCREEN_WIDTH - 32),
            animated: true,
        });
        setCurrentTicketIndex(currentIndex);
    };

    return (
        <Animated.View
            style={[
                {
                    flex: 1,
                    backgroundColor: '#F8F8F8',
                },
            ]}>
            <View style={tailwind.style('')}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ alignItems: 'center' }}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleScrollEnd}
                    scrollEventThrottle={16}>
                    {(ticketDetails?.services || []).map((item, index) => {
                        const [date, time] = new Date(item.expiryDate || '').toISOString().split('T');
                        const isTicketLive =
                            item.status === 'Confirmed' &&
                            (today && date ? today <= date : true) &&
                            (time ? currentTime <= convertUTCTimeToISTTimeinHHMMSS(time) : false);
                        const isTicketExpired =
                            item.status === 'Verified' ||
                            (item.status === 'Confirmed' &&
                                ((today && date ? today > date : true) ||
                                    (time ? currentTime > convertUTCTimeToISTTimeinHHMMSS(time) : false)));
                        const isBoatingTicket = item.categories.every(v =>
                            v.peopleCategories.every(v => v.name === 'Boat'),
                        );

                        return (
                            <View key={`ticket-${index}`} style={{ width: SCREEN_WIDTH - 32 }}>
                                <Animated.View
                                    style={tailwind.style(`w-full items-center mx-auto bg-[#FFFFFF] rounded-[24px]`)}>
                                    <Icon
                                        icon={<TicketsIcon width={75} height={35} color="#F8F8F8" />}
                                        style={tailwind.style(
                                            `absolute -top-1.8 left-[${SCREEN_WIDTH / 2 - 50}px] z-100 `,
                                        )}
                                    />
                                    <Icon
                                        icon={<TicketsIcon width={75} height={35} color="#F8F8F8" />}
                                        style={{
                                            position: 'absolute',
                                            bottom: -7.2,
                                            left: SCREEN_WIDTH / 2 - 50,
                                            zIndex: 100,
                                            transform: [{ rotate: '180deg' }],
                                        }}
                                    />

                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                `z-100 w-full items-start justify-start overflow-hidden mb-12 pt-2`,
                                            ),
                                        ]}>
                                        {isTicketLive && (
                                            <Animated.View
                                                accessibilityLabel={'Ticket status is live'}
                                                style={{ marginBottom: -8 }}>
                                                <Icon
                                                    icon={<LiveSvg />}
                                                    style={tailwind.style(' pt-[14px] px-[32px]')}
                                                />
                                            </Animated.View>
                                        )}

                                        {/* <Animated.View
                                        style={tailwind.style(
                                            'flex-col items-center justify-center gap-20 absolute top-16 -left-6 mb-2',
                                        )}
                                        accessible={false}
                                        importantForAccessibility="no-hide-descendants">
                                        {Array.from({ length: 30 }).map((_, idx) => (
                                            <Animated.Text
                                                key={`ticket-text-left-${idx}`}
                                                style={tailwind.style(
                                                    'text-[#CACACA] text-[9px] font-departureMono-regular text-center font-semibold ',
                                                    {
                                                        transform: [{ rotate: `90deg` }],
                                                    },
                                                )}>
                                                {'ZOO TICKET'}
                                            </Animated.Text>
                                        ))}
                                    </Animated.View>
                                    <Animated.View
                                        style={tailwind.style(
                                            'flex-col items-center justify-center gap-20 absolute top-16 -right-6 mb-2',
                                        )}
                                        accessible={false}
                                        importantForAccessibility="no-hide-descendants">
                                        {Array.from({ length: 30 }).map((_, idx) => (
                                            <Animated.Text
                                                key={`ticket-text-right-${idx}`}
                                                style={tailwind.style(
                                                    'text-[#CACACA] text-[9px] font-departureMono-regular text-center font-semibold ',
                                                    {
                                                        transform: [{ rotate: `90deg` }],
                                                    },
                                                )}>
                                                {'ZOO TICKET'}
                                            </Animated.Text>
                                        ))}
                                    </Animated.View> */}

                                        <TicketDetails
                                            ticketServiceName={ticketDetails?.ticketPlaceName || ''}
                                            visitedDate={visitedDate}
                                            totalTickets={`${totalTickets}`}
                                            index={index}
                                            totalServices={ticketDetails?.services?.length || 1}
                                            isBoatingTicket={isBoatingTicket}
                                        />

                                        {isTicketLive && (
                                            <Animated.View
                                                style={tailwind.style(
                                                    'w-[82%] h-[95px] rounded-[32px]  mx-auto mt-6 overflow-hidden',
                                                )}>
                                                {isFocus && <AnimatedTimer expireDate={item.expiryDate || ''} />}
                                            </Animated.View>
                                        )}

                                        <Animated.View style={[tailwind.style('mt-7'), { width: '100%' }]}>
                                            <Animated.View style={tailwind.style('items-center')}>
                                                {currentTicketIndex > 0 && (
                                                    <TouchableOpacity
                                                        testID={`left-chevron-${index}`}
                                                        style={tailwind.style('absolute left-6 top-1/3 mt-5')}
                                                        onPress={() => {
                                                            const newIndex = currentTicketIndex - 1;
                                                            setCurrentTicketIndex(newIndex);
                                                            setTimeout(() => {
                                                                if (scrollViewRef.current) {
                                                                    scrollViewRef.current.scrollTo({
                                                                        x: newIndex * (SCREEN_WIDTH - 32),
                                                                        animated: true,
                                                                    });
                                                                }
                                                            }, 0);
                                                        }}
                                                        accessibilityRole="button"
                                                        accessibilityLabel="Previous ticket">
                                                        <Image
                                                            accessible={true}
                                                            accessibilityLabel="chevron left"
                                                            source={chevronLeft}
                                                            style={{
                                                                width: 28,
                                                                height: 28,
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                )}

                                                <QrCodeView
                                                    jsonString={item.ticketServiceShortId}
                                                    status={item.status}
                                                    isTicketExpired={isTicketExpired}
                                                    size={undefined}
                                                />

                                                {currentTicketIndex < (ticketDetails?.services?.length || 0) - 1 && (
                                                    <TouchableOpacity
                                                        testID={`right-chevron-${index}`}
                                                        style={tailwind.style('absolute right-6 top-1/3 mt-5 bold')}
                                                        onPress={() => {
                                                            const newIndex = currentTicketIndex + 1;
                                                            setCurrentTicketIndex(newIndex);
                                                            setTimeout(() => {
                                                                if (scrollViewRef.current) {
                                                                    scrollViewRef.current.scrollTo({
                                                                        x: newIndex * (SCREEN_WIDTH - 32),
                                                                        animated: true,
                                                                    });
                                                                }
                                                            }, 0);
                                                        }}
                                                        accessibilityRole="button"
                                                        accessibilityLabel="Next ticket">
                                                        <Image
                                                            accessible={true}
                                                            accessibilityLabel="chevron right"
                                                            source={chevronRight}
                                                            style={{
                                                                width: 28,
                                                                height: 28,
                                                                tintColor: '#14171F',
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                            </Animated.View>
                                        </Animated.View>

                                        <Animated.View style={tailwind.style('mx-auto pt-3')}>
                                            <PassengerCountDisplay
                                                breakdown={getPropleCategory(item)}
                                                isBoatingTicket={isBoatingTicket}
                                            />
                                        </Animated.View>

                                        <CardDetails
                                            item={item}
                                            expiryDate={formatDateWithDay(item.expiryDate)}
                                            index={index}
                                            isTicketLive={isTicketLive}
                                            placeName={ticketDetails?.ticketPlaceName || ''}
                                            latitude={ticketDetails?.lat}
                                            longitude={ticketDetails?.lon}
                                            isBoatingTicket={isBoatingTicket}
                                        />
                                    </Animated.View>
                                </Animated.View>
                            </View>
                        );
                    })}
                </ScrollView>

                <Animated.View style={tailwind.style('flex-row justify-center mt-4 mb-2')}>
                    {(ticketDetails?.services || []).map((_, index) => {
                        return (
                            <Animated.View
                                key={`dot-${index}`}
                                style={[
                                    {
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        marginHorizontal: 4,
                                    },
                                    index === currentTicketIndex
                                        ? { backgroundColor: '#14171F' }
                                        : { backgroundColor: '#B2B9C7' },
                                ]}
                            />
                        );
                    })}
                </Animated.View>
            </View>
        </Animated.View>
    );
};

export default React.memo(TicketContent);

const styles = StyleSheet.create({
    detailIcon: {
        width: 32,
        height: 32,
        marginRight: 10,
    },
    dashedLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    dashDot: {
        width: 12,
        height: 1,
        backgroundColor: '#F5F5F5',
    },
    cardTitle: {
        color: '#B2B9C7',
        fontSize: 14,
        fontWeight: '500',
    },
    cardContent: {
        color: '#454C55',
        fontSize: 15,
        fontWeight: '600',
        marginTop: 4,
    },
    passengerCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F2F7',
        borderRadius: 60,
        paddingHorizontal: 18,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 12,
    },
    passengerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passengerIcon: {
        width: 13,
        height: 13,
        marginRight: 8,
        tintColor: '#14171F',
    },
    passengerText: {
        color: '#14171F',
        fontSize: 17,
        fontWeight: '500',
    },
    separator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#14171F',
        marginHorizontal: 12,
    },
});
