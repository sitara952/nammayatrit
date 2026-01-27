import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { BackButton } from '@/src-v2/multimodal/components/common/BackButton';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { createAction } from '@/typescript/utils/common';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { SearchTarget } from '../../utils/PublicTransportUtils';
import SearchContainer from '../Search/components/SearchContainer';
import { SearchResultItem } from '../Search/components/SearchSectionListItem/types';
import LocateOnMapDirectBusBooking from './Components/LocateOnMapDirectBusBooking';
import RecentSearches from './Components/RecentSearches';
import { ToggleOptions } from './Components/ToggleOptions';
import { SingleModeSearchProps } from './Types';
import ToAndFromSearchInputAlternate from '../Search/components/ToAndFromSearchInputAlternate';
export const SingleModeSearchUI = React.memo<SingleModeSearchProps>(props => {
    const {
        mpDispatch,
        suggestions,
        isRepeatBookingsLoading,
        searchPublicTransport,
        loadingSuggestions,
        vehicleType,
        recentSearches,
        startStop,
        repeatBookings,
        startStopDistance,
        showEditSource,
        setShowEditSource,
        isSrcHasDestinations,
        onHardwareBackPress,
        fallbackView,
        appName,
        appSystemConfig,
    } = props;
    const { bottom, top } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [showLocateOnMap, setShowLocateOnMap] = useState(false);

    const filterMode = useRef<SearchTarget>('both');
    const searchString = useRef<string>('');

    const setSearchString = useCallback(
        (str: string) => {
            searchString.current = str;
            searchPublicTransport(str, filterMode.current);
        },
        [searchPublicTransport],
    );

    const headerComponent = useMemo(() => {
        const handleBackPress = () => {
            Keyboard.dismiss();
            if (showEditSource) {
                setShowEditSource(false);
                filterMode.current = 'both';
                setSearchString('');
            } else {
                mpDispatch(createAction('GO_BACK', undefined));
            }
        };

        const editSourceComponent = (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={tailwind.style('px-4')}>
                <Animated.View style={tailwind.style('flex-row items-center justify-between w-full')}>
                    <BackButton onPress={handleBackPress} />
                    <Animated.Text style={tailwind.style('font-areaNormal-extrabold text-[13px] text-[#969696]')}>
                        {userLanguageStrings.EditPickuplocation}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('w-[16px] h-[44px]')} />
                </Animated.View>

                <Animated.View style={tailwind.style('pt-[20px] pb-[14px]')}>
                    <TextInput
                        accessibilityLabel="Text input field"
                        autoFocus={true}
                        onChangeText={text => {
                            setSearchString(text);
                        }}
                        placeholder={userLanguageStrings.EnterPickupLocation}
                        placeholderTextColor="#C4C4C4"
                        style={tailwind.style(
                            'font-areaNormal-extrabold text-[14px] text-[#3B3A3C] bg-white rounded-[16px] h-[45px] px-[22px] border border-[#F1F2F2]',
                        )}
                    />
                </Animated.View>
            </Animated.View>
        );

        return (
            <Animated.View
                accessible={true}
                accessibilityLabel="Search header"
                entering={FadeIn.springify()
                    .damping(500)
                    .stiffness(1000)
                    .mass(3)
                    .overshootClamping(1)
                    .restDisplacementThreshold(10)
                    .restSpeedThreshold(10)}
                exiting={FadeOut.duration(200)}
                style={[tailwind.style('z-30 pt-[14px]')]}>
                {showEditSource ? editSourceComponent : null}
                {!showEditSource ? (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Animated.View style={tailwind.style('flex flex-row justify-between px-4')}>
                            <Animated.View style={tailwind.style('flex-row w-full items-center justify-between')}>
                                <BackButton onPress={handleBackPress} />
                                {!fallbackView && (
                                    <ToggleOptions
                                        onChange={i => {
                                            if (i === 0) {
                                                filterMode.current = 'both';
                                            } else if (i === 1) {
                                                filterMode.current = 'routes';
                                            } else if (i === 2) {
                                                filterMode.current = 'stops';
                                            }
                                            searchPublicTransport(searchString.current, filterMode.current);
                                        }}
                                    />
                                )}
                            </Animated.View>

                            {/* {showEditTransitBtn && (
                            <Pressable {...handlers} onPress={handleShowEditTransit}>
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            'px-[14px] py-[11px] rounded-full bg-[#ECEDEF] flex-row items-center justify-center gap-[10px]',
                                        ),
                                        animatedStyle,
                                    ]}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[14px] text-[#3B3A3C] leading-[16px]',
                                        )}>
                                        Edit Transit
                                    </Animated.Text>
                                    <Icon icon={<FilterIcon />} />
                                </Animated.View>
                            </Pressable>
                        )} */}
                        </Animated.View>
                        <ToAndFromSearchInputAlternate
                            dropLocation={searchString.current}
                            setDropLocation={setSearchString}
                            startLocation={startStop?.name ?? userLanguageStrings.Yourlocation}
                            startLocationDistance={startStopDistance}
                            setStartLocation={() => {}}
                            enableAutoFocus={true}
                            appName={appName}
                            fallbackView={fallbackView}
                            handleOnSourcePress={() => {
                                filterMode.current = 'stops';
                                setShowEditSource(true);
                            }}
                        />
                    </Animated.View>
                ) : null}
            </Animated.View>
        );
    }, [searchString, startStop?.name, startStopDistance, showEditSource]);

    const initialView = useMemo(() => {
        return (
            <Animated.View layout={LinearTransition}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tailwind.style(`pb-[${bottom + 16}px]`)}>
                    {/* <RoutesAroundYou
                onPress={routeCode => {
                    mpDispatch(
                        createAction('SINGLE_MODE_TICKET_BOOKING', {
                            routeCode: routeCode,
                            sourceStopCode: undefined,
                            destStopCode: undefined,
                        }),
                    );
                }}
                mode={castToMultimodalTravelMode(mode)}
                routeList={nearbyRoutes}
                isLoading={loading}
            /> */}
                    {!fallbackView && recentSearches && recentSearches.length > 0 && (
                        <RecentSearches
                            isLoading={false}
                            recentsList={recentSearches}
                            onRecentSearchPress={item => mpDispatch(createAction('SINGLE_MODE_TICKET_BOOKING', item))}
                        />
                    )}
                </ScrollView>
            </Animated.View>
        );
    }, [bottom, recentSearches, repeatBookings, isRepeatBookingsLoading, vehicleType, mpDispatch]);

    const handleSearchOnSingleModePress = useCallback(
        (route: SearchResultItem) => {
            if (showEditSource && route.stopCode) {
                mpDispatch(createAction('SET_SELECTED_SOURCE_STOP', route.stopCode));
                setShowEditSource(false);
                filterMode.current = 'both';
                setSearchString('');
            } else {
                mpDispatch(createAction('SINGLE_MODE_TICKET_BOOKING', route));
            }
        },
        [showEditSource, mpDispatch, setShowEditSource, filterMode, setSearchString],
    );

    const handleFallbackCase = useCallback(
        (route: SearchResultItem) => {
            mpDispatch(createAction('HANDLE_FALLBACK_CASE', { routeCode: route.routeCode ?? '' }));
        },
        [mpDispatch],
    );

    return (
        <HardwareBackpressHandler onHardwareBackPress={onHardwareBackPress}>
            <>
                <View style={[tailwind.style('flex-1 bg-[#F5F5F5]'), { paddingTop: top }]}>
                    {showLocateOnMap ? (
                        <LocateOnMapDirectBusBooking
                            onClose={() => setShowLocateOnMap(false)}
                            stopName={startStop?.name ?? ''}
                            address={startStop?.address ?? ''}
                        />
                    ) : (
                        <>
                            {headerComponent}
                            {searchString?.current?.length === 0 && !appSystemConfig?.uiConfig.hideRepeatBookings ? (
                                initialView
                            ) : (
                                <>
                                    <SearchContainer
                                        dropLocation={searchString.current}
                                        setDropLocation={setSearchString}
                                        onSearchModalClose={() => {}}
                                        handleSearchOnPress={undefined}
                                        handleSearchOnSingleModePress={
                                            fallbackView ? handleFallbackCase : handleSearchOnSingleModePress
                                        }
                                        searchResults={suggestions}
                                        editTransitValues={[]}
                                        onTransitSwitchChange={(_transit, _value) => {}}
                                        onBusRoutePress={_value => {}}
                                        onEditTransitConfirmPress={() => {}}
                                        showEditTransitBtn={false}
                                        isLoading={loadingSuggestions}
                                        isMultimodal={false}
                                    />
                                    {!isSrcHasDestinations && (
                                        <Animated.View
                                            entering={FadeIn}
                                            exiting={FadeOut}
                                            style={tailwind.style('items-center px-8 py-2')}>
                                            <Animated.View
                                                style={tailwind.style('bg-white rounded-2xl p-6 w-full items-center')}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'font-areaNormal-extrabold text-[16px] text-[#3B3A3C] text-center mb-2',
                                                    )}>
                                                    {
                                                        userLanguageStrings.ThereAreNoAvailableBusesForTheSelectedSourceAndDestination
                                                    }
                                                    .
                                                </Animated.Text>
                                            </Animated.View>
                                        </Animated.View>
                                    )}
                                </>
                            )}
                            {/* <LocateOnMapButton onPress={() => setShowLocateOnMap(true)} /> */}
                        </>
                    )}
                </View>
            </>
        </HardwareBackpressHandler>
    );
});
