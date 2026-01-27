import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { SheetBackdrop } from '@/src-v2/screens/reviewAndFeedback/components/SheetBackdrop';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { createAction } from '@/typescript/utils/common';
import BottomSheet, { BottomSheetModal, BottomSheetView, SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { isUndefined } from 'lodash';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { ImageProps, Platform, View } from 'react-native';
import { NavigationProp, RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Animated, { LinearTransition, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';
import { MetroSubwayBookingProps } from '../MetroSubwayBooking/Types';
import { SourcePickerSheetContent } from './components/SourcePickerSheetContent';
import CrossIcon from '../Search/components/svg/CloseIcon';
import RepeatBookings from '../SingleModeSearch/Components/RepeatBookings';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { DestinationPickerWithSections } from './components/DestinationPickerWithSections';

import { PopUpModal } from '@/typescript/components/PopUpModal';
import Button from '@/src-v2/primitives/Button';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import MetroStationBufferImg from '@/src-v2/assets/mt_ic_metro_station.webp';
import SuburbanStationBufferImg from '@/src-v2/assets/mt_ic_subway_station.webp';
import { VideoRef } from 'react-native-video';

import { Image } from 'react-native';
import { ExploreOtherServicesPopUp } from './components/ExploreOtherServicesPopUp';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { getUserLanguageStringsForMode } from '../../utils/BusServiceUtils';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { SingleModeBookingParamList } from '@/typescript/navigation/globalParamList';
import { useMetroSubwayServiceability } from '@/src-v2/multimodal/hooks/useMetroSubwayServiceability';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { logPrefixSuffixEvent } from '@/typescript/utils/logger';
import { EventSuffix } from '@/typescript/utils/loggerEnums';
import { selectAppState } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';

const CaretDown = () => {
    return (
        <Svg width="11" height="6" viewBox="0 0 11 6" fill="none">
            <Path
                d="M0.997696 1L5.13645 5.13875C5.274 5.27631 5.48932 5.27631 5.62688 5.13875L9.76562 1"
                stroke="#969696"
                strokeWidth="1.5"
                strokeMiterlimit="10"
            />
        </Svg>
    );
};

const EditIcon = () => {
    return (
        <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.47645 12.2343C2.28855 12.2343 2.10065 12.1621 1.96334 12.0248C1.80435 11.8658 1.73208 11.6562 1.75376 11.4321L2.06452 8.59923C2.0862 8.43301 2.15847 8.28125 2.2741 8.16562L8.25069 2.18903C8.83606 1.60366 9.79 1.60366 10.3754 2.18903L11.7991 3.61272C12.0809 3.89456 12.2399 4.27036 12.2399 4.67506C12.2399 5.07976 12.0809 5.45556 11.7991 5.73741L5.82247 11.7068C5.69961 11.8224 5.54785 11.9019 5.38886 11.9163L2.55594 12.2271H2.47645V12.2343ZM3.13409 8.83772L2.88838 11.0997L5.15037 10.854L9.17647 6.82296L7.16019 4.80667L3.13409 8.83772ZM11.033 4.96413L9.94252 6.05597L7.92624 4.03968L9.01673 2.94785C9.18295 2.78163 9.45034 2.78163 9.60933 2.94785L11.033 4.37153C11.1125 4.45103 11.1559 4.5522 11.1559 4.66783C11.1559 4.78346 11.1125 4.88464 11.033 4.96413ZM8.59766 12.2417V11.1576L12.2491 11.1582V12.2422L8.59766 12.2417Z"
                fill="#656565"
            />
        </Svg>
    );
};

// NotchedHandle.tsx

export const NotchedHandle = () => {
    // Calculate center point for the notch
    const centerX = SCREEN_WIDTH / 2;
    // Set a fixed notch width and height
    const notchWidth = 56;
    const notchHeight = 14;

    return (
        <View
            style={[
                tailwind.style('absolute h-5 w-full rounded-t-[34px] overflow-hidden z-0'),
                { transform: [{ translateY: -18 }] },
            ]}>
            <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <Defs>
                    <ClipPath id="notchPath">
                        <Path
                            d={`
                            M0,0
                            H${centerX - notchWidth / 2}
                            C${centerX - notchWidth / 3},0 ${
                                centerX - notchWidth / 6
                            },${notchHeight} ${centerX},${notchHeight}
                            C${centerX + notchWidth / 6},${notchHeight} ${centerX + notchWidth / 3},0 ${
                                centerX + notchWidth / 2
                            },0
                            H${SCREEN_WIDTH}
                            V${40}
                            H0
                            Z
                            `}
                        />
                    </ClipPath>
                </Defs>
                <Rect x="0" y="0" width={SCREEN_WIDTH} height="40" fill="#F4F4F4" clipPath="url(#notchPath)" />
            </Svg>
            {/* Invisible spacer for height */}
            <View style={{ height: 40 }} />
        </View>
    );
};

interface SourceCardProps {
    onEditSource: () => void;
    selectedStation: transportStation | null;
    isEditable: boolean;
}

const SourceCard = (props: SourceCardProps) => {
    const { onEditSource, selectedStation, isEditable } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');
    return (
        <Animated.View
            style={tailwind.style('min-h-[78px] mx-4 rounded-[20px]', isEditable ? 'bg-white' : 'bg-transparent')}>
            <Pressable
                testID="source-card"
                onPress={onEditSource}
                style={tailwind.style('pt-[14px] items-center')}
                accessible
                accessibilityLabel={`Source Station ${selectedStation ? selectedStation.name : ''} button`}
                accessibilityRole="button"
                accessibilityHint={`Click here to Edit Source Station`}>
                <Animated.Text
                    style={tailwind.style(
                        'text-xs leading-[13px] font-areaNormal-extrabold text-[#656565] translate-[0.2px] pt-2px',
                    )}>
                    {userLanguageStrings.Sourcestation}
                    {/* {selectedStation ? '' : userLanguageStrings.Zero_One_kmaway} */}
                </Animated.Text>
                <Animated.View style={tailwind.style('flex-row items-center pt-3')}>
                    <Animated.View style={tailwind.style('flex-1 items-center px-12')}>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[15px] leading-[19px] font-areaNormal-extrabold translate-[0.2px] underline capitalize',
                                selectedStation ? 'text-[#3B3A3C]' : 'text-[#969696]',
                            )}>
                            {selectedStation ? selectedStation.name : userLanguageStrings.Entersourcestation}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={tailwind.style('absolute right-4 items-end top-3')}>
                        <Animated.View
                            style={tailwind.style(
                                `bg-[${colors.CrossButton_bg}] w-6 h-6 justify-center items-center rounded-full`,
                            )}>
                            <EditIcon />
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

interface DestinationCardProps {
    onEditDestination: () => void;
    selectedStation: transportStation | null;
}

const DestinationCard = (props: DestinationCardProps) => {
    const { onEditDestination, selectedStation } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');
    return (
        <Animated.View style={tailwind.style('bg-white min-h-[78px] mx-4 rounded-[20px]')}>
            <Pressable
                testID="destination-card"
                onPress={onEditDestination}
                style={tailwind.style('pt-[14px] items-center')}
                accessible
                accessibilityLabel={`Destination Station ${selectedStation ? selectedStation.name : ''} button`}
                accessibilityRole="button"
                accessibilityHint="Click here to Edit Destination Station">
                <Animated.Text
                    style={tailwind.style(
                        'text-xs leading-[13px] font-areaNormal-extrabold text-[#656565] translate-[0.2px] pt-2px',
                    )}>
                    {userLanguageStrings.Destinationstation}
                </Animated.Text>
                <Animated.View style={tailwind.style('flex-row items-center pt-3')}>
                    <Animated.View style={tailwind.style('flex-1 items-center px-4')}>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[15px] leading-[19px] font-areaNormal-extrabold  translate-[0.2px] underline capitalize',
                                selectedStation ? 'text-[#3B3A3C]' : 'text-[#969696]',
                            )}>
                            {selectedStation ? selectedStation.name : userLanguageStrings.Enterdestinationstation}
                        </Animated.Text>
                    </Animated.View>
                    {selectedStation ? (
                        <Animated.View style={tailwind.style('absolute right-4 items-end top-3')}>
                            <Animated.View
                                style={tailwind.style(
                                    `bg-[${colors.CrossButton_bg}] w-6 h-6 justify-center items-center rounded-full`,
                                )}>
                                <EditIcon />
                            </Animated.View>
                        </Animated.View>
                    ) : null}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

// New CTA Button component
const BookTicketButton = ({
    onPress,
    disabled,
    buttonText,
}: {
    onPress: () => void;
    disabled: boolean;
    buttonText: string;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <Button
            testID="book-ticket-button"
            type={'primary'}
            disabled={disabled}
            style={({ pressed }: { pressed: boolean }) => [
                tailwind.style(
                    'bg-[#F74940] mx-4 min-h-14 justify-center items-center rounded-[16px]',
                    disabled ? 'bg-[#E5E5E5]' : pressed ? 'bg-[#E53935]' : 'bg-[#F44336]',
                ),
                { backgroundColor: themeColors.Button_primary_default_fill_base },
            ]}
            onPress={onPress}>
            <Animated.Text
                style={tailwind.style('text-[16px] leading-[22px] font-areaNormal-bold text-center capitalize', {
                    color: themeColors.Button_Primary_Default_Text_Base,
                })}>
                {buttonText}
            </Animated.Text>
        </Button>
    );
};

// Custom BottomSheet Footer
const CustomBottomSheetFooter = ({
    sourceStation,
    destinationStation,
    onBookTicket,
    vehicleType,
}: {
    sourceStation: transportStation | undefined;
    destinationStation: transportStation | undefined;
    onBookTicket: () => void;
    vehicleType: VehicleCategory_vehicleCategory;
}) => {
    // Check if both source and destination stations are selected

    const isButtonEnabled = useMemo(() => {
        return sourceStation !== undefined && destinationStation !== undefined;
    }, [sourceStation, destinationStation]);

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { isServiceable } = useMetroSubwayServiceability(vehicleType);

    const { bottom } = useSafeAreaInsets();
    return (
        <Animated.View
            entering={SlideInDown.springify().damping(34).stiffness(240)}
            exiting={SlideOutDown.springify().damping(34).stiffness(240)}
            style={tailwind.style('bg-white w-full absolute bottom-0 z-30', `pt-4 pb-[${bottom ? bottom : 16}px]`)}>
            <BookTicketButton
                buttonText={
                    isServiceable
                        ? `${userLanguageStrings.BookTicket(getUserLanguageStringsForMode(vehicleType === 'SUBWAY' ? 'Train' : vehicleType, userLanguageStrings))}`
                        : userLanguageStrings.ReviewJourney
                }
                onPress={onBookTicket}
                disabled={!isButtonEnabled}
            />
        </Animated.View>
    );
};

const SingleModeMetroTicketBookingUIBase = (props: MetroSubwayBookingProps) => {
    const [videoKey, setVideoKey] = useState(0); // Force video re-render
    const videoRef = useRef<VideoRef | null>(null);

    const navigation = useNavigation<NavigationProp<SingleModeBookingParamList, 'metroSubwayBooking'>>();
    const route = useRoute<RouteProp<SingleModeBookingParamList, 'metroSubwayBooking'>>();

    useFocusEffect(
        useCallback(() => {
            // Force video to completely reload by changing the key
            setVideoKey(prev => prev + 1);
            if (route.params?.triggerEditDestination) {
                setIsDestinationPickerActive(true);
                ref.current?.expand();
                navigation.setParams({ triggerEditDestination: false });
            }
        }, [route.params?.triggerEditDestination, navigation]),
    );

    const { top } = useSafeAreaInsets();
    const appState = useAppSelector(selectAppState);
    const ref = useRef<BottomSheet>(null);
    const sourceModalRef = useRef<BottomSheetModal>(null);
    // State to control if destination picker is expanded in main BottomSheet
    const [isDestinationPickerActive, setIsDestinationPickerActive] = useState(false);

    const mainContentRef = useRef<View>(null);
    const sourcePickerRef = useRef<View>(null);
    const destinationPickerRef = useRef<View>(null);

    const accessibilityManager = useAccessibilityFocus({
        mainContentRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 50,
    });

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const {
        mpDispatch,
        sourceStation,
        destinationStation,
        sortedStationsForSourcePicker,
        sortedStationsForDestinationPicker,
        vehicleType,
    } = props;

    const handleEditSource = useCallback(() => {
        sourceModalRef.current?.present();
        accessibilityManager.pushToFocusStack(sourcePickerRef, 'SourcePicker');
        accessibilityManager.setFocus(sourcePickerRef);
        accessibilityManager.hideAccessibility(mainContentRef);
    }, [accessibilityManager]);

    const handleEditDestination = useCallback(() => {
        setIsDestinationPickerActive(true);
        ref.current?.expand();
        if (isDestinationPickerActive && destinationPickerRef.current) {
            accessibilityManager.pushToFocusStack(destinationPickerRef, 'DestinationPicker');
            accessibilityManager.setFocus(destinationPickerRef);
            accessibilityManager.hideAccessibility(mainContentRef);
        }
    }, [accessibilityManager, destinationPickerRef.current, isDestinationPickerActive]);

    const handleSelectSourceStation = useCallback(
        (item: transportStation) => {
            mpDispatch(createAction('UPDATE_SOURCE', { station: item }));
        },
        [mpDispatch, vehicleType],
    );

    useEffect(() => {
        if (appState === 'active') {
            setVideoKey(prev => prev + 1);
        }
    }, [appState]);

    const handleSelectDestinationStation = useCallback(
        (item: transportStation) => {
            logPrefixSuffixEvent(
                vehicleType,
                EventSuffix.SOURCE_DESTINATION_ENTERED,
                sourceStation?.name + '_' + destinationStation?.name,
            );
            mpDispatch(createAction('UPDATE_DESTINATION', { station: item }));
            ref.current?.collapse();
            setIsDestinationPickerActive(false);
            accessibilityManager.popFromFocusStack();
            accessibilityManager.showAccessibility(mainContentRef);
            accessibilityManager.restoreFocus();
        },
        [mpDispatch, vehicleType, accessibilityManager],
    );

    const isRouteToggleEnabled = useMemo(() => {
        if (sortedStationsForDestinationPicker.length > 1) {
            return (
                sortedStationsForDestinationPicker[0]?.index !== sortedStationsForDestinationPicker[0]?.toggableIndex
            );
        }
        return false;
    }, [sortedStationsForDestinationPicker]);

    const handleBlurDestination = useCallback(() => {
        setIsDestinationPickerActive(false);
        ref.current?.collapse();
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [accessibilityManager]);

    const handleBookTicket = useCallback(() => {
        mpDispatch(createAction('CONFIRM_SELECTION', undefined));
    }, [mpDispatch, sourceStation, destinationStation]);

    const handleSourcePickerDismiss = useCallback(() => {
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [accessibilityManager]);
    const { bottom } = useSafeAreaInsets();
    const memoizedSnapPoints = useMemo(() => {
        return isDestinationPickerActive
            ? Platform.OS === 'ios'
                ? ['90%']
                : [SCREEN_HEIGHT - top]
            : props.repeatBookings && props.repeatBookings.length > 0 && !isUndefined(destinationStation)
              ? [335 + bottom]
              : props.repeatBookings && props.repeatBookings.length > 0
                ? [400 + bottom]
                : isUndefined(destinationStation)
                  ? [290]
                  : [360];
    }, [isDestinationPickerActive, props.repeatBookings, destinationStation]);
    return (
        <HardwareBackpressHandler>
            <>
                <View style={tailwind.style('flex-1 relative')}>
                    <Animated.View ref={mainContentRef}>
                        <BackgroundImage style={tailwind.style('absolute w-full h-full')} vehicleType={vehicleType} />
                        <VideoPlayer
                            key={videoKey}
                            source={{
                                uri:
                                    vehicleType === 'SUBWAY'
                                        ? 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vids/1754768813804.mp4'
                                        : 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vids/1754768764921.mp4',
                            }}
                            videoRef={videoRef}
                            shouldLoop={false}
                            onBuffer={() => {}}
                            onError={() => {}}
                            resizeMode="cover"
                            style={tailwind.style('h-full w-full')}
                            containerStyle={undefined}
                            fallbackElement={
                                <BackgroundImage style={tailwind.style('w-full h-full')} vehicleType={vehicleType} />
                            }
                            bufferingElement={
                                <BackgroundImage style={tailwind.style('w-full h-full')} vehicleType={vehicleType} />
                            }
                            onVideoEnd={undefined}
                            autoPlay={undefined}
                            bufferConfig={undefined}
                            pauseVideo={false}
                            videoControls={undefined}
                            onStateChange={undefined}
                            muted={undefined}
                            bufferingDelay={undefined}
                            enableNetworkOptimizations={true}
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
                    </Animated.View>
                    {!isDestinationPickerActive && sourceStation && destinationStation ? (
                        <CustomBottomSheetFooter
                            sourceStation={sourceStation}
                            destinationStation={destinationStation}
                            onBookTicket={handleBookTicket}
                            vehicleType={vehicleType}
                        />
                    ) : null}
                    {/* Source Picker Modal */}
                    <BottomSheetModal
                        enableDynamicSizing={false}
                        index={0}
                        backgroundComponent={SheetBackdrop}
                        ref={sourceModalRef}
                        topInset={top}
                        enableHandlePanningGesture={false}
                        handleComponent={null}
                        snapPoints={['100%']}
                        backgroundStyle={tailwind.style('bg-[#F4F4F4] rounded-t-[34px]')}
                        onDismiss={handleSourcePickerDismiss}>
                        <SourcePickerSheetContent
                            stationsList={sortedStationsForSourcePicker}
                            selectedStation={sourceStation ?? null}
                            onSelectStation={handleSelectSourceStation}
                            bottomSheetRef={sourceModalRef}
                            accessibilityRef={sourcePickerRef}
                        />
                    </BottomSheetModal>

                    <BottomSheet
                        maxDynamicContentSize={SCREEN_HEIGHT - top - 24}
                        enablePanDownToClose={false}
                        enableDynamicSizing={false}
                        index={0}
                        handleComponent={NotchedHandle}
                        backgroundStyle={[tailwind.style('rounded-t-none bg-[#F4F4F4] overflow-visible')]}
                        ref={ref}
                        snapPoints={memoizedSnapPoints}>
                        <BottomSheetView style={tailwind.style('')}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Go Back button"
                                onPress={() => {
                                    if (isDestinationPickerActive) setIsDestinationPickerActive(false);
                                    else mpDispatch(createAction('GO_BACK', undefined));
                                }}
                                testID="metro-subway-go-back"
                                style={tailwind.style('z-99 ')}>
                                <Animated.View
                                    style={tailwind.style(
                                        'absolute left-4 top-0.5 bg-[#E6E6E6] w-[37px] h-9 justify-center items-center rounded-full ',
                                    )}>
                                    <CrossIcon />
                                </Animated.View>
                            </Pressable>
                            {!isDestinationPickerActive ? (
                                <>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(34).stiffness(240)}
                                        style={tailwind.style(
                                            'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] pt-2 text-center',
                                        )}>
                                        {userLanguageStrings.Book}{' '}
                                        {vehicleType === 'SUBWAY'
                                            ? userLanguageStrings.Train
                                            : userLanguageStrings.Metro}
                                    </Animated.Text>
                                    <Animated.View
                                        layout={LinearTransition.springify().damping(34).stiffness(240)}
                                        style={tailwind.style('pt-6')}>
                                        <SourceCard
                                            onEditSource={handleEditSource}
                                            selectedStation={sourceStation ?? null}
                                            isEditable={true}
                                        />
                                        <Animated.View style={tailwind.style('justify-center items-center py-3')}>
                                            <CaretDown />
                                        </Animated.View>
                                        <DestinationCard
                                            onEditDestination={handleEditDestination}
                                            selectedStation={destinationStation ?? null}
                                        />
                                    </Animated.View>

                                    {props.isDataLoaded &&
                                        props.repeatBookings &&
                                        props.repeatBookings.length > 0 &&
                                        isUndefined(destinationStation) &&
                                        (() => {
                                            const filteredBookings =
                                                vehicleType === 'METRO' && sourceStation
                                                    ? props.repeatBookings.filter(
                                                          booking => booking.fromStopCode === sourceStation.code,
                                                      )
                                                    : props.repeatBookings;

                                            if (filteredBookings.length > 0) {
                                                return (
                                                    <RepeatBookings
                                                        enableContentScroll={true}
                                                        source={sourceStation}
                                                        scrollDirection="horizontal"
                                                        isLoading={props.isRepeatBookingsLoading}
                                                        bookingsList={filteredBookings}
                                                        vehicleType={vehicleType}
                                                        onRoutePress={() => {}}
                                                        isFallback={false}
                                                        onBookingPress={(routeCode, sourceStopCode, destStopCode) =>
                                                            mpDispatch(
                                                                createAction('SINGLE_MODE_REPEAT_TICKET', {
                                                                    routeCode,
                                                                    sourceStopCode,
                                                                    destStopCode,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                );
                                            }

                                            const flattenedDestinations = (
                                                sortedStationsForDestinationPicker || []
                                            ).flatMap(section => section.stations);
                                            const sourceIndex = sourceStation
                                                ? flattenedDestinations.findIndex(
                                                      station => station.code === sourceStation.code,
                                                  )
                                                : -1;

                                            const nextFourStops =
                                                sourceIndex >= 0 && sourceIndex < flattenedDestinations.length - 1
                                                    ? flattenedDestinations.slice(sourceIndex + 2, sourceIndex + 6)
                                                    : [];
                                            const fallbackBookings =
                                                vehicleType === 'METRO'
                                                    ? nextFourStops.map(station => ({
                                                          fromStopName: sourceStation?.name,
                                                          toStopName: station.name,
                                                          price: 0,
                                                          routeCode: '',
                                                          routeShortName: '',
                                                          fromStopCode: sourceStation?.code || '',
                                                          toStopCode: station.code,
                                                      }))
                                                    : [];

                                            if (fallbackBookings.length > 0) {
                                                return (
                                                    <RepeatBookings
                                                        enableContentScroll={true}
                                                        source={sourceStation}
                                                        scrollDirection="horizontal"
                                                        isLoading={false}
                                                        bookingsList={fallbackBookings}
                                                        vehicleType={vehicleType}
                                                        isFallback={true}
                                                        onRoutePress={() => {}}
                                                        onBookingPress={(routeCode, sourceStopCode, destStopCode) =>
                                                            mpDispatch(
                                                                createAction('SINGLE_MODE_REPEAT_TICKET', {
                                                                    routeCode,
                                                                    sourceStopCode,
                                                                    destStopCode,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                );
                                            }
                                            return null;
                                        })()}
                                </>
                            ) : null}
                            {isDestinationPickerActive ? (
                                <>
                                    <SourceCard
                                        onEditSource={handleEditSource}
                                        selectedStation={sourceStation ?? null}
                                        isEditable={false}
                                    />
                                    <Animated.View style={tailwind.style('justify-center items-center')}>
                                        <CaretDown />
                                    </Animated.View>
                                    <View style={tailwind.style('mx-4')}>
                                        <DestinationPickerWithSections
                                            stationSections={sortedStationsForDestinationPicker}
                                            selectedStation={destinationStation ?? null}
                                            onSelectStation={handleSelectDestinationStation}
                                            onClose={handleBlurDestination}
                                            sourceStation={sourceStation ?? null}
                                            isRouteToggleEnabled={isRouteToggleEnabled}
                                            handleRouteToggle={() => {
                                                mpDispatch(createAction('TOGGLE_ROUTE', undefined));
                                            }}
                                            accessibilityRef={destinationPickerRef}
                                            title="Destination Stop"
                                        />
                                    </View>
                                </>
                            ) : null}
                        </BottomSheetView>
                    </BottomSheet>
                </View>
                <PopUpModal
                    sheetRef={props.serviceUnavailableModalRef}
                    isScrollable={false}
                    onHardwareBackPress={() => {
                        props.serviceUnavailableModalRef.current?.dismiss();
                    }}
                    showBackdrop={true}
                    enableDismissOnClose={true}
                    enablePanDownToClose={false}>
                    <View style={{ padding: 24, alignItems: 'center' }}>
                        <ExploreOtherServicesPopUp
                            vehicleType={vehicleType}
                            userLanguageStrings={userLanguageStrings}
                            serviceableStartTime={props.serviceableStartTime}
                            serviceUnavailableModalRef={props.serviceUnavailableModalRef}
                            mpDispatch={mpDispatch}
                            withExploreRouteButton={true}
                            onExploreOtherService={() => {}}
                            styles={undefined}
                        />
                    </View>
                </PopUpModal>
            </>
        </HardwareBackpressHandler>
    );
};

const _BackgroundImage = ({
    style,
    vehicleType,
}: {
    style: ImageProps;
    vehicleType: VehicleCategory_vehicleCategory;
}) => (
    <Image
        accessible={false}
        resizeMode="cover"
        source={vehicleType === 'SUBWAY' ? SuburbanStationBufferImg : MetroStationBufferImg}
        style={style}
    />
);

const BackgroundImage = React.memo(_BackgroundImage);

export const SingleModeMetroTicketBookingUI = React.memo(SingleModeMetroTicketBookingUIBase);
