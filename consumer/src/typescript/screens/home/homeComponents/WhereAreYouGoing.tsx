import ArrowRight from '@/typescript/assets/svg/symbols/ArrowRight';
import { Icon } from '@/typescript/components/Icon';
// import { TranslateXLoop } from '@/typescript/components/TranslateXLoop';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import {
    setBottomSheetStage,
    BottomSheetStage,
    setActiveInput,
    SearchInput,
    setFareProductType,
    setGoBackToRental,
    selectCurrentLocationCoords,
    removeAllSearchedStops,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { memo, useCallback, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectActiveBookingIds } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { GeolocationResponse } from '@/typescript/utils/location';
import { logger } from '@/src-v2/systems/logger';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { strings, ThemeTokens } from 'config-types';
import ComingSoonModal from '@/typescript/components/ComingSoonModal';
import * as MoEngage from '@/typescript/utils/moengage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_WIDTH_MINUS_80 = SCREEN_WIDTH;
const SCREEN_WIDTH_MINUS_100 = SCREEN_WIDTH - 40;

type WhereAreYouGoingViewProps = {
    recenterLocation: (zoomLevel: number | undefined, position: GeolocationResponse | undefined) => void;
};

// memoized inner component to handle rendering
const WhereAreYouGoingContent = memo(
    ({
        onPressSearchInput,
        whereYouGoingTextColor,
        haveActiveRides,
        userLanguageStrings,
        themeColors,
    }: {
        onPressSearchInput: () => void;
        whereYouGoingTextColor: string;
        haveActiveRides: boolean;
        userLanguageStrings: strings;
        themeColors: ThemeTokens;
    }) => {
        // Memoized animated styles

        const searchBarAnimatedStyle = useAnimatedStyle(
            () => ({
                // backgroundColor: interpolateColor(
                //     sheetAnimatedIndex.value,
                //     [0, 0.9, 1],
                //     [themeColors.where_you_going_bg, themeColors.where_you_going_bg, themeColors.Fill_neutralLow],
                // ),
                backgroundColor: themeColors.where_you_going_bg,
            }),
            [],
        );

        const fontAnimatedStyle = useAnimatedStyle(
            () => ({
                // color: interpolateColor(
                //     sheetAnimatedIndex.value,
                //     [0, 0.9, 1],
                //     [whereYouGoingTextColor, whereYouGoingTextColor, '#313131'],
                // ),
                color: whereYouGoingTextColor,
            }),
            [],
        );

        return (
            <Animated.View style={[styles.container, { width: SCREEN_WIDTH_MINUS_80 }]}>
                <Animated.View style={{ width: SCREEN_WIDTH_MINUS_100 }}>
                    <Pressable
                        testID="home_where_are_you_going"
                        accessibilityLabel={'Where are you going button'}
                        onPress={onPressSearchInput}
                        accessible
                        accessibilityRole="button"
                        accessibilityHint="Click here to book the ride">
                        <Animated.View style={[styles.searchBar, searchBarAnimatedStyle]}>
                            <View style={styles.textContainer}>
                                <Typography
                                    type="subhead-4"
                                    style={[styles.typography, fontAnimatedStyle]}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Whereareyougoing_QuestionMark}
                                </Typography>
                            </View>
                            {/* <TranslateXLoop> */}
                            <Animated.View>
                                {!haveActiveRides ? (
                                    <Icon
                                        icon={<ArrowRight fill={whereYouGoingTextColor} bold />}
                                        size={13}
                                        color={whereYouGoingTextColor}
                                    />
                                ) : null}
                            </Animated.View>
                            {/* </TranslateXLoop> */}
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        );
    },
);

const WhereAreYouGoingView = (props: WhereAreYouGoingViewProps) => {
    const dispatch = useAppDispatch();
    const activeRideIds = useAppSelector(selectActiveBookingIds);
    const haveActiveRides = activeRideIds.length > 0;
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const appConfig = useAppSelector(selectAppConfig);

    const [showComingSoonModal, setShowComingSoonModal] = useState(false);

    const whereYouGoingTextColor = themeColors.where_you_going_text;

    // Track ad impression
    // useAdImpression();

    const handleOnPressSearchInput = useCallback(() => {
        //Check if ride hailing is enabled for the city
        if (!appConfig.flowConfig.enable_ride_hailing) {
            setShowComingSoonModal(true);
            hapticEffect(HapticFeedbackTypes.impactMedium, undefined);
            return;
        }

        // Log ad click event
        // logAdEvent(EventName.AD_CLICK, {
        //     event_id: uuid.v4(),
        //     campaign_id: null,
        //     campaign_item_id: null,
        //     view_unit_id: null,
        //     platform: Platform.OS,
        //     app_version: DeviceInfo.getVersion(),
        // });

        // Test MoEngage SDK Integration
        MoEngage.logEvent('where_are_you_going_clicked', {
            screen: 'home',
            timestamp: new Date().toISOString(),
        });
        console.info('MoEngage event tracked: where_are_you_going_clicked');

        props.recenterLocation(undefined, undefined);
        dispatch(removeAllSearchedStops());
        dispatch(setFareProductType(null));
        dispatch(setGoBackToRental(false));
        dispatch(
            setActiveInput(
                currentLocationCoords?.coords.latitude && currentLocationCoords?.coords.longitude
                    ? SearchInput.Destination
                    : SearchInput.Source,
            ),
        );
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'wryg_searchInput' }));
        logger.logInfo(`HomeScreen:WhereWouldYouLikeToGo`, 'BookingFlow');
        hapticEffect(HapticFeedbackTypes.impactMedium, undefined);
    }, [dispatch, props, currentLocationCoords, appConfig.flowConfig.enable_ride_hailing]);

    return (
        <>
            <WhereAreYouGoingContent
                onPressSearchInput={handleOnPressSearchInput}
                whereYouGoingTextColor={whereYouGoingTextColor}
                haveActiveRides={haveActiveRides}
                userLanguageStrings={userLanguageStrings}
                themeColors={themeColors}
            />
            <ComingSoonModal
                visible={showComingSoonModal}
                onClose={() => setShowComingSoonModal(false)}
                title="COMING SOON"
                message="This will be available in future versions of the application"
            />
        </>
    );
};

export default memo(WhereAreYouGoingView);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 18,
        alignItems: 'center',
        paddingLeft: 18,
        paddingRight: 16,
        paddingVertical: 20,
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typography: {
        textAlign: 'left',
        paddingLeft: 2,
    },
    arrowContainer: {
        paddingRight: 8,
    },
});
