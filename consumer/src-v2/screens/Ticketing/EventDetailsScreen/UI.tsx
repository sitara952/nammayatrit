import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Keyboard, LayoutChangeEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import calendarImage from '@/typescript/assets/ticketing/ys_white_calendar.webp';
import { createAction, safe } from '@/typescript/utils/common';
import { EventDetailsScreenProps, EventInfoProps, ImageCarouselProps } from './Types';
import tipIcon from '@/typescript/assets/ticketing/ys_ic_tip_icon.webp';
import chevronLeft from '@/typescript/assets/ticketing/ys_white_background_chevronLeft.webp';
import chevronRight from '@/typescript/assets/ticketing/ys_white_background_chevronRight.webp';
import locationImage from '@/typescript/assets/ticketing/ys_ticketing_location.webp';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import ChevronRight from '@/typescript/assets/svg/symbols/ChevronRight';
import {
    formatDateToReadable,
    convertUTCToISTAnd12HourFormat,
    addHoursToTime,
    getMaxTime,
    convertUTCTimeToISTTimeinHHMMSS,
} from '../utils/ticketingHelper';
import { ticketPlace } from '@/readOnly/api/types/TicketPlace.gen';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { TermsAndCondition } from '../utils/TermsAndCondition';
import { FrequentlyAskedQuestions } from '../utils/FrequentlyAskedQuestions';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { strings } from 'config-types';
import { attraction } from '@/readOnly/api/types/Attraction.gen';
import {
    BottomSheetStage,
    selectAppConfig,
    setBottomSheetStage,
    updateSelectedSearchedStop,
} from '@/typescript/state/client/session';
import mtIcMyTickets from '@/typescript/assets/ticketing/mt_ic_my_tickets.webp';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import Button from '@/src-v2/primitives/Button';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const ImageCarousel: React.FC<ImageCarouselProps> = React.memo(({ imageUrls, height = 200 }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
    };

    const goToIndex = (index: number) => {
        setCurrentIndex(index);
    };

    if (!imageUrls || imageUrls.length === 0) {
        return null;
    }

    return (
        <Animated.View style={carouselStyles.container}>
            <Animated.View>
                <Image
                    accessible={true}
                    accessibilityLabel="event image"
                    source={{ uri: imageUrls[currentIndex] }}
                    style={[carouselStyles.mainImage, { height }]}
                    resizeMode="cover"
                />

                {imageUrls.length > 1 && (
                    <>
                        <TouchableOpacity
                            testID="carousel-prev-button"
                            style={[carouselStyles.arrowButton, carouselStyles.leftArrow]}
                            onPress={goToPrevious}
                            accessibilityRole="button"
                            accessibilityLabel="Previous image">
                            <Image accessible={false} source={chevronLeft} style={{ width: 38, height: 38 }} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="carousel-next-button"
                            style={[carouselStyles.arrowButton, carouselStyles.rightArrow]}
                            onPress={goToNext}
                            accessibilityRole="button"
                            accessibilityLabel="Next image">
                            <Image accessible={false} source={chevronRight} style={{ width: 38, height: 38 }} />
                        </TouchableOpacity>
                    </>
                )}
            </Animated.View>

            {imageUrls.length > 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={carouselStyles.thumbnailContent}>
                    {imageUrls.map((url, index) => (
                        <TouchableOpacity
                            key={index}
                            testID={`thumbnail-${index}`}
                            onPress={() => goToIndex(index)}
                            style={[carouselStyles.thumbnail, currentIndex === index && carouselStyles.activeThumbnail]}
                            accessibilityRole="button"
                            accessibilityLabel={`View image ${index + 1}`}>
                            <Image
                                accessible={false}
                                source={{ uri: url }}
                                style={carouselStyles.thumbnailImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </Animated.View>
    );
});

const getStatus = (
    isRecurring: boolean,
    startDate: string,
    endDate: string,
    openTimings: string,
    closeTimings: string,
    userLanguageStrings: strings,
) => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    const timeToMinutes = (timeStr: string) => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0) + Math.round((seconds || 0) / 60);
    };

    const isClosingSoon = () => {
        if (!currentTime) return false;
        const closeTimeMinutes = timeToMinutes(closeTimings);
        const currentTimeMinutes = timeToMinutes(currentTime);
        const timeDiff = closeTimeMinutes - currentTimeMinutes;
        return timeDiff <= 60 && timeDiff > 0;
    };

    const isOpen = () => {
        if (!currentTime || !currentDate) return false;

        const openTimeMinutes = timeToMinutes(openTimings);
        const closeTimeMinutes = timeToMinutes(closeTimings);
        const currentTimeMinutes = timeToMinutes(currentTime);
        const timeCheck = currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
        const dateCheck = currentDate >= startDate && currentDate <= endDate;

        return timeCheck && dateCheck;
    };

    const isComingSoon = () => {
        if (!currentDate || !currentTime) return false;
        if (!isRecurring && currentDate < startDate) {
            return true;
        }
        const openTimeMinutes = timeToMinutes(openTimings);
        const currentTimeMinutes = timeToMinutes(currentTime);
        return currentDate === startDate && currentTimeMinutes < openTimeMinutes;
    };

    const openResult = isOpen();
    const comingSoonResult = isComingSoon();
    const closingSoonResult = isClosingSoon();

    if (openResult) return closingSoonResult ? userLanguageStrings.ClosingSoon : userLanguageStrings.Opennow;
    if (comingSoonResult)
        return isRecurring
            ? `${userLanguageStrings.Opensat} ${convertUTCToISTAnd12HourFormat(openTimings)}`
            : userLanguageStrings.ComingSoon;
    return userLanguageStrings.Closed;
};

const StatusPill: React.FC<{ event: ticketPlace; operationalDate: string; closedTiming: string }> = React.memo(
    ({ event, operationalDate, closedTiming }) => {
        const configManager = useConfigContext();
        if (!event.startDate || !event.endDate || !event.openTimings || !event.closeTimings) return <></>;
        const themeColors = configManager.get('themeColors');
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const status = getStatus(
            event.isRecurring,
            event.isRecurring ? operationalDate : event.startDate,
            event.endDate,
            convertUTCTimeToISTTimeinHHMMSS(event.openTimings || ''),
            closedTiming,
            userLanguageStrings,
        );
        return (
            <Animated.View
                style={[
                    styles.timeCard,
                    {
                        backgroundColor:
                            status === 'Open now'
                                ? themeColors.Fill_positiveLow
                                : status === 'Closing Soon'
                                  ? themeColors.Fill_positiveWarm
                                  : status === 'Closed'
                                    ? themeColors.Fill_negativeLow
                                    : status === 'Comming Soon'
                                      ? themeColors.Fill_infoLow
                                      : themeColors.Fill_infoLow,
                    },
                ]}>
                <Typography
                    type="title-800"
                    numberOfLines={undefined}
                    accessibilityRole={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={[
                        styles.timeCardText,
                        {
                            color:
                                status === 'Open now'
                                    ? themeColors.Icon_positive
                                    : status === 'Closing Soon'
                                      ? themeColors.Fill_warningHigh
                                      : status === 'Closed'
                                        ? themeColors.Fill_negativeHigh
                                        : status === 'Comming Soon'
                                          ? themeColors.Fill_neutralMax
                                          : themeColors.Fill_neutralMax,
                        },
                    ]}>
                    {status}
                </Typography>
            </Animated.View>
        );
    },
);

const DetailsCard: React.FC<{
    event: ticketPlace;
    operationalDate: string;
    closedTiming: string;
}> = React.memo(({ event, operationalDate, closedTiming }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const gateOpeningTime = event.metadata?.find(item => item.key === 'gateOpenTime');
    return (
        <Animated.View style={styles.titleSection}>
            <Typography
                type="title-800"
                accessibilityRole={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                style={styles.eventTitle}>
                {event?.name}
            </Typography>
            <Animated.View style={styles.dateBox}>
                <Image
                    accessible={false}
                    source={calendarImage}
                    style={{ width: 23, height: 25, marginRight: 15, marginTop: 3 }}
                />
                <Animated.View style={{ flex: 1 }}>
                    <Typography
                        type="title-800"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.dateText}>
                        {event.isRecurring
                            ? operationalDate
                                ? `${new Date(operationalDate).getDate()} ${new Date(operationalDate).toLocaleDateString('en-US', { month: 'long' })} - ${userLanguageStrings.Onwards}`
                                : ''
                            : formatDateToReadable(event.startDate, userLanguageStrings)}
                    </Typography>
                    {gateOpeningTime && (
                        <Typography
                            type="body"
                            accessibilityRole={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={[styles.showTime, { marginTop: -3 }]}>
                            {userLanguageStrings.Gatesopenat + ' ' + gateOpeningTime.value}
                        </Typography>
                    )}
                </Animated.View>
                <StatusPill event={event} operationalDate={operationalDate} closedTiming={closedTiming} />
            </Animated.View>
        </Animated.View>
    );
});

const EventInfo: React.FC<EventInfoProps> = React.memo(({ iconUrl, title, description }) => {
    return (
        <Animated.View style={styles.infoRow}>
            <Image accessible={false} source={{ uri: iconUrl }} style={{ width: 21, height: 21, marginRight: 16 }} />
            <Animated.View style={{ flexDirection: 'column' }}>
                <Typography
                    type="body"
                    accessibilityRole={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.infoLabel}>
                    {title}
                </Typography>
                <Text style={styles.infoValue}>{description}</Text>
            </Animated.View>
        </Animated.View>
    );
});

const Header: React.FC<EventDetailsScreenProps> = React.memo(props => {
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={styles.banner}>
            <Image
                accessible={true}
                accessibilityLabel="banner image"
                source={{
                    uri: props.event?.iconUrl,
                }}
                style={styles.bannerImage}
            />
            <Animated.View style={styles.topIcons}>
                <TouchableOpacity
                    testID="a5d4c403-cfd5-484e-a2e7-917d40327025"
                    accessible={true}
                    accessibilityHint="Go Back"
                    accessibilityRole="button"
                    onPress={() => {
                        props.mpDispatch(createAction('PRESSED_BACK', undefined));
                    }}>
                    <ChevronLeftIcon />
                </TouchableOpacity>

                {appConfig.screenConfig.eventScreenConfig.showAllTicketButton && (
                    <TouchableOpacity
                        testID="4a5d0d6b-29e5-473a-958e-cc184e1d5888"
                        accessible={true}
                        accessibilityHint="Share"
                        accessibilityRole="button"
                        style={{
                            backgroundColor: '#FFFFFF',
                            paddingHorizontal: 16,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: '#E0E3E8',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            props.mpDispatch(createAction('GET_TICKETS_HISTORY', undefined));
                        }}>
                        <Image
                            accessible={false}
                            source={mtIcMyTickets}
                            style={{ width: 15, height: 15, marginRight: 10 }}
                        />
                        <Typography
                            type="body"
                            accessibilityRole={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={{ fontSize: 13 }}>
                            {userLanguageStrings.MyTickets}
                        </Typography>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </Animated.View>
    );
});

const NavigationTabs: React.FC<{
    activeTab: string;
    onTabPress: (tab: string) => void;
}> = React.memo(({ activeTab, onTabPress }) => {
    return (
        <Animated.View style={styles.tabs}>
            <FlatList
                data={['About', 'Gallery', 'Direction']}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => onTabPress(item)}
                        testID="5bc42254-425b-47cb-a2ce-dbdc9ce54c2d"
                        accessibilityRole="button"
                        accessibilityLabel={`Navigate to ${item} section`}>
                        <Animated.View style={[styles.tabButton, activeTab === item && styles.activeTabButton]}>
                            <Typography
                                type="title-800"
                                accessibilityRole={undefined}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                style={[styles.tabText, activeTab === item && styles.activeTabText]}>
                                {item}
                            </Typography>
                        </Animated.View>
                    </Pressable>
                )}
            />
        </Animated.View>
    );
});

const EventDetailSection: React.FC<{
    event: ticketPlace;
    onLayout: (sectionName: string, y: number) => void;
}> = React.memo(({ event, onLayout }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const handleLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const { y } = event.nativeEvent.layout;
            onLayout('About', y);
        },
        [onLayout],
    );

    return (
        <>
            {event.description && (
                <Animated.View style={styles.aboutSection} onLayout={handleLayout}>
                    <Typography
                        type="title-800"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.sectionTitle}>
                        {userLanguageStrings.About}
                    </Typography>
                    <Typography
                        type="body-subtext"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.aboutText}>
                        {event.description}
                    </Typography>
                </Animated.View>
            )}
            {event.metadata && event.metadata.length > 0 && (
                <Animated.View style={{ marginBottom: 10 }}>
                    {event?.metadata?.map(metaData => {
                        return metaData.key === 'ticketDay' || metaData.key === 'gateOpenTime' ? (
                            <></>
                        ) : (
                            <EventInfo iconUrl={metaData.icon} title={metaData.key} description={metaData.value} />
                        );
                    })}
                </Animated.View>
            )}
        </>
    );
});

const GallerySection: React.FC<{ event: ticketPlace; onLayout: (sectionName: string, y: number) => void }> = React.memo(
    ({ event, onLayout }) => {
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');

        const handleLayout = useCallback(
            (event: LayoutChangeEvent) => {
                const { y } = event.nativeEvent.layout;
                onLayout('Gallery', y);
            },
            [onLayout],
        );

        return (
            <>
                {event?.gallery.length && event?.gallery.length > 0 ? (
                    <Animated.View style={styles.galaryCard} onLayout={handleLayout}>
                        <Typography
                            type="title-800"
                            accessibilityRole={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={styles.sectionTitle}>
                            {userLanguageStrings.Gallery}
                        </Typography>
                        <ImageCarousel imageUrls={event?.gallery} height={200} />
                    </Animated.View>
                ) : null}
            </>
        );
    },
);

const VenueSection: React.FC<{ props: EventDetailsScreenProps; onLayout: (sectionName: string, y: number) => void }> =
    React.memo(({ props, onLayout }) => {
        const configManager = useConfigContext();
        const dispatch = useAppDispatch();
        const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
        const userLanguageStrings = configManager.get('userLanguageStrings');

        useEffect(() => {
            const getAsyncSourceLocation = async () => {
                const data = await safe(
                    GetLocationAndServiceability.getLocationObjectAndServiceability(
                        {
                            TAG: 'PlaceByLatLon',
                            _0: {
                                contents: {
                                    lat: props.event.lat || 0,
                                    lon: props.event.lon || 0,
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
        }, [props.event.lat, props.event.lon]);

        const handleLayout = useCallback(
            (event: LayoutChangeEvent) => {
                const { y } = event.nativeEvent.layout;
                onLayout('Direction', y);
            },
            [onLayout],
        );

        return (
            <>
                <Animated.View style={{ marginBottom: 25 }} onLayout={handleLayout}>
                    <Typography
                        type="title-800"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.sectionTitle}>
                        {userLanguageStrings.Venue}
                    </Typography>
                    <Animated.View style={styles.venueCard}>
                        <Animated.View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <Image
                                accessible={false}
                                source={locationImage}
                                style={{ width: 18, height: 20, marginRight: 14 }}
                            />
                            <Typography
                                type="body"
                                accessibilityRole={undefined}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                style={styles.venueTitle}>
                                {props.event.name}
                            </Typography>
                        </Animated.View>
                        <Typography
                            type="body"
                            accessibilityRole={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={styles.venueAddress}>
                            {props.event.venue}
                        </Typography>
                        <Pressable
                            style={styles.directionButton}
                            testID="0195b813-eeed-4aad-bad8-763f5638bdf2"
                            onPress={() => {
                                props.mpDispatch(createAction('GET_DIRECTION', undefined));
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Get directions to venue button">
                            <Image
                                accessible={false}
                                source={tipIcon}
                                style={{
                                    width: 20,
                                    height: 20,
                                    marginRight: 5,
                                }}
                            />
                            <Typography
                                type="body"
                                accessibilityRole={undefined}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                style={styles.directionText}>
                                {userLanguageStrings.Direction}
                            </Typography>
                        </Pressable>
                        <Button
                            testID={`book_ride_to_eventplace`}
                            type="primary"
                            text={`${userLanguageStrings.BookRideto} ${props.event.name}`}
                            style={{
                                borderRadius: 10,
                                justifyContent: 'center',
                                marginTop: 15,
                                marginHorizontal: 18,
                            }}
                            onPress={() => {
                                dispatch(
                                    setBottomSheetStage({
                                        stage: BottomSheetStage.ConfirmPickup,
                                        src: 'searchForRides_dest',
                                    }),
                                );
                                navigation.navigate(
                                    'mainTabNavigation',
                                    { screen: 'homeTab_homeScreen' },
                                    { pop: true },
                                );
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </>
        );
    });

const FaqAndTermsCondition: React.FC<{ event: ticketPlace }> = React.memo(({ event }) => {
    const { termsAndConditionSheetRef, faqSheetRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            {((event?.faqs && event?.faqs.length > 0) ||
                (event?.termsAndConditions && event?.termsAndConditions.length > 0)) && (
                <Animated.View style={{ marginBottom: 25 }}>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.sectionTitle}>
                        {userLanguageStrings.More}
                    </Typography>
                    <Animated.View style={styles.moreCard}>
                        {event?.faqs && event?.faqs.length > 0 && (
                            <Pressable
                                testID="faq-button"
                                onPress={() => {
                                    faqSheetRef.current?.present();
                                }}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                accessibilityRole="button"
                                accessibilityLabel="View frequently asked questions button">
                                <Animated.View style={{ flex: 1 }}>
                                    <Typography
                                        type="subhead-600"
                                        accessibilityRole={undefined}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={styles.venueTitle}>
                                        {userLanguageStrings.FrequentlyaskedQuestion}
                                    </Typography>
                                </Animated.View>
                                <ChevronRight />
                            </Pressable>
                        )}
                        {event?.faqs &&
                            event?.faqs.length > 0 &&
                            event?.termsAndConditions &&
                            event?.termsAndConditions.length > 0 && (
                                <Animated.View
                                    style={tailwind.style('border-[0.7px] border-[#F1F2F7] mt-4 mb-3')}></Animated.View>
                            )}
                        {event?.termsAndConditions && event?.termsAndConditions.length > 0 && (
                            <Pressable
                                testID="terms-and-conditions-button"
                                onPress={() => {
                                    termsAndConditionSheetRef.current?.present();
                                }}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                accessibilityRole="button"
                                accessibilityLabel="View terms and conditions button">
                                <Animated.View style={{ flex: 1 }}>
                                    <Typography
                                        type="subhead-600"
                                        accessibilityRole={undefined}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={styles.venueTitle}>
                                        {userLanguageStrings.TermsandCondition}
                                    </Typography>
                                </Animated.View>
                                <ChevronRight />
                            </Pressable>
                        )}
                    </Animated.View>
                </Animated.View>
            )}
        </>
    );
});

const _NearByPlaces: React.FC<{ nearByPlaces: attraction[] }> = React.memo(({ nearByPlaces }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.View>
                <Typography
                    type="title-800"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessibilityRole={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.sectionTitle}>
                    {userLanguageStrings.Explorearoundyou}
                </Typography>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.cardsContainer}>
                    {nearByPlaces && nearByPlaces.length > 0
                        ? nearByPlaces.map((card, index) => (
                              <Animated.View key={index} style={styles.exploreCard}>
                                  <Image
                                      accessible={false}
                                      source={{ uri: '' }}
                                      style={styles.exploreCardImage}
                                      resizeMode="cover"
                                  />
                                  <Animated.View style={styles.exploreCardContent}>
                                      <Typography
                                          type="title-800"
                                          numberOfLines={1}
                                          accessibilityRole={undefined}
                                          isAnimate={undefined}
                                          accessible={undefined}
                                          accessibilityLabel={undefined}
                                          style={styles.exploreCardTitle}>
                                          {card.name}
                                      </Typography>
                                      <TouchableOpacity
                                          testID={`nearby_places_click_${index}`}
                                          style={styles.exploreBookButton}
                                          accessibilityRole="button"
                                          accessibilityLabel={`Book tickets for ${card.name}`}>
                                          <Typography
                                              type="title-800"
                                              numberOfLines={undefined}
                                              accessibilityRole={undefined}
                                              isAnimate={undefined}
                                              accessible={undefined}
                                              accessibilityLabel={undefined}
                                              style={styles.exploreBookButtonText}>
                                              {userLanguageStrings.Book}
                                          </Typography>
                                      </TouchableOpacity>
                                  </Animated.View>
                              </Animated.View>
                          ))
                        : null}
                </ScrollView>
            </Animated.View>
        </>
    );
});

const EventDetailsScreenUI: React.FC<EventDetailsScreenProps> = props => {
    const { termsAndConditionSheetRef, faqSheetRef } = useRefsContext();
    const [activeTab, setActiveTab] = useState<string>('About');
    const { top, bottom } = useSafeAreaInsets();
    const event = props.event;
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const scrollViewRef = useRef<ScrollView>(null);
    const detailsContainerRef = useRef<View>(null);
    const detailsContainerOffsetRef = useRef<number>(0);
    const [sectionPositions, setSectionPositions] = useState<{ [key: string]: number }>({});

    const closedTiming = props.businessHour
        .map(bh => {
            const slotWithBuffer = bh.slot ? convertUTCTimeToISTTimeinHHMMSS(addHoursToTime(bh.slot, 3)) : null;
            const closedTime = bh.endTime ? convertUTCTimeToISTTimeinHHMMSS(bh.endTime) : null;
            if (slotWithBuffer) {
                return slotWithBuffer;
            } else if (closedTime) {
                return closedTime;
            } else {
                return null;
            }
        })
        .filter((time): time is string => time !== null)
        .reduce((latest, current) => getMaxTime(latest, current), '');

    const handleDetailsContainerLayout = useCallback((event: LayoutChangeEvent) => {
        const { y } = event.nativeEvent.layout;
        detailsContainerOffsetRef.current = y;
    }, []);

    const handleSectionLayout = useCallback((sectionName: string, y: number) => {
        setSectionPositions(prev => ({
            ...prev,
            [sectionName]: detailsContainerOffsetRef.current + y,
        }));
    }, []);

    const handleTabPress = useCallback(
        (tab: string) => {
            setActiveTab(tab);
            const sectionName = tab === 'About' ? 'About' : tab === 'Gallery' ? 'Gallery' : 'Direction';
            const position = sectionPositions[sectionName];
            if (position !== undefined && scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: position, animated: true });
            }
        },
        [sectionPositions],
    );

    return (
        <HardwareBackpressHandler
            onHardwareBackPress={() => {
                props.mpDispatch(createAction('PRESSED_BACK', undefined));
            }}>
            <Animated.View style={styles.screen}>
                <ScrollView
                    ref={scrollViewRef}
                    style={[styles.content, { paddingTop: top }]}
                    contentContainerStyle={{ paddingBottom: bottom }}
                    showsVerticalScrollIndicator={false}>
                    <Header {...props} />
                    <Animated.View
                        ref={detailsContainerRef}
                        style={styles.details}
                        onLayout={handleDetailsContainerLayout}>
                        <DetailsCard
                            event={event}
                            operationalDate={props.operationalDate}
                            closedTiming={closedTiming}
                        />
                        <NavigationTabs activeTab={activeTab} onTabPress={handleTabPress} />
                        <EventDetailSection event={event} onLayout={handleSectionLayout} />
                        <GallerySection event={event} onLayout={handleSectionLayout} />
                        <VenueSection props={props} onLayout={handleSectionLayout} />
                        <FaqAndTermsCondition event={event} />
                        <Animated.View style={{ height: 95 }} />
                    </Animated.View>
                </ScrollView>

                <Animated.View style={[styles.bottomBar, { marginBottom: bottom }]}>
                    <Animated.View>
                        <Text style={styles.price}>{'₹' + (event?.pricingOnwards || 0) + ' onwards'}</Text>
                        <Text style={styles.availability}>{userLanguageStrings.Available}</Text>
                    </Animated.View>
                    <Pressable
                        style={[
                            styles.bookButton,
                            {
                                backgroundColor:
                                    event.status === 'ComingSoon'
                                        ? themeColors.Fill_neutralMid
                                        : themeColors.choose_category_button_bg,
                            },
                        ]}
                        testID="deb8c673-fbbf-422a-90ce-ef73daac0aa3"
                        onPress={() => {
                            if (event.status !== 'ComingSoon') {
                                props.mpDispatch(createAction('BOOK_TICKET', undefined));
                            }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Book tickets for this event">
                        <Text
                            style={[
                                styles.bookButtonText,
                                {
                                    color:
                                        event.status === 'ComingSoon'
                                            ? themeColors.Fill_neutralMax
                                            : themeColors.choose_category_button_text,
                                },
                            ]}>
                            {event.status === 'ComingSoon'
                                ? userLanguageStrings.ComingSoons
                                : userLanguageStrings.BookTickets}
                        </Text>
                    </Pressable>
                </Animated.View>

                <PopUpModal
                    sheetRef={termsAndConditionSheetRef}
                    onAnimate={() => Keyboard.dismiss()}
                    showBackdrop={undefined}
                    onHardwareBackPress={undefined}
                    snapPoints={['80%']}
                    isScrollable={true}>
                    <TermsAndCondition terms={event?.termsAndConditions || []} />
                </PopUpModal>

                <PopUpModal
                    sheetRef={faqSheetRef}
                    onAnimate={() => Keyboard.dismiss()}
                    showBackdrop={undefined}
                    onHardwareBackPress={undefined}
                    snapPoints={['80%']}
                    isScrollable={true}>
                    <FrequentlyAskedQuestions faqs={event?.faqs || []} />
                </PopUpModal>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

export default React.memo(EventDetailsScreenUI);

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    gallerySection: {},
    content: {},
    banner: {},
    bannerImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    topIcons: {
        position: 'absolute',
        top: 20,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        elevation: 3,
    },
    iconText: {
        fontSize: 16,
    },
    details: {
        padding: 16,
        paddingTop: 20,
    },
    titleSection: {
        marginBottom: 24,
    },
    eventTitle: {
        marginBottom: 18,
        color: '#14171F',
        textAlign: 'left',
    },
    dateBox: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeCard: {
        backgroundColor: '#E8F1FF',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingTop: 4,
        paddingBottom: 5,
    },
    timeCardText: {
        color: '#454C55',
        fontSize: 13,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
    },
    showTime: {
        fontSize: 13,
        color: '#5B6777',
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    tabButton: {
        borderRadius: 20,
        paddingTop: 5,
        paddingBottom: 8,
        paddingHorizontal: 15,
        marginRight: 12,
        backgroundColor: '#EBEBEB',
    },
    activeTabButton: {
        backgroundColor: '#14171F',
    },
    tabText: {
        color: '#3B3A3C',
        fontSize: 16,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    aboutSection: {
        marginBottom: 24,
    },
    aboutText: {
        fontSize: 15,
        color: '#14171F',
        lineHeight: 20,
    },
    readMore: {
        fontSize: 13,
        color: '#1e40af',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 14,
        alignItems: 'center',
    },
    infoIcon: {
        width: 24,
        fontSize: 16,
    },
    infoLabel: {
        color: '#14171F',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '400',
        color: '#7B8997',
    },
    galaryCard: { marginBottom: 28 },
    venueCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 5,
    },
    moreCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 15,
        marginTop: 5,
    },
    venueTitle: {
        fontSize: 16,
        color: '#14171F',
    },
    venueAddress: {
        color: '#5B6777',
        marginBottom: 18,
        marginLeft: 32,
        lineHeight: 18,
    },
    directionButton: {
        flexDirection: 'row',
        marginLeft: 32,
        alignItems: 'center',
    },
    directionText: {
        fontSize: 15,
        color: '#016ACD',
        textDecorationLine: 'underline',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        height: 80,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    price: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2F2D32',
    },
    availability: {
        fontSize: 13,
        fontWeight: '500',
        color: 'green',
        marginTop: 1,
    },
    bookButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    bookButtonText: {
        fontWeight: '600',
        fontSize: 17,
    },
    sectionTitle: {
        fontSize: 15,
        color: '#78747C',
        marginBottom: 10,
        textAlign: 'left',
    },
    cardsContainer: {
        gap: 12,
    },
    exploreCard: {
        width: 250,
        height: 214,
        borderRadius: 12,
    },
    exploreCardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    exploreCardContent: {
        position: 'absolute',
        bottom: 3,
        left: 3,
        right: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    exploreCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#14171F',
        flex: 1,
        marginRight: 8,
    },
    exploreBookButton: {
        backgroundColor: '#FDCB6B',
        paddingHorizontal: 14,
        paddingTop: 5,
        paddingBottom: 7,
        borderRadius: 18,
    },
    exploreBookButtonText: {
        color: '#14171F',
        fontSize: 14,
        fontWeight: '700',
    },
});

const carouselStyles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    mainImage: {
        width: '100%',
        flex: 1,
        borderRadius: 10,
    },
    arrowButton: {
        position: 'absolute',
        top: '55%',
        transform: [{ translateY: -20 }],
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    leftArrow: {
        left: 10,
    },
    rightArrow: {
        right: 10,
    },
    arrowText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    thumbnailContent: {
        paddingTop: 12,
    },
    thumbnail: {
        width: 80,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 8,
    },
    activeThumbnail: {
        borderColor: '#B2B9C7',
        borderWidth: 3,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
});
