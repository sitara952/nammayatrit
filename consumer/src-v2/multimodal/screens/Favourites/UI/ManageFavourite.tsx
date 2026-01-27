import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { ManageFavouritesProps } from '../Types';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import LocationFavouriteFlow from '../Flow/LocationFavourite';
import DriverFavouriteUI from './DriverFavourite';
import { Header } from '@/src-v2/primitives/Header';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';

const ManageFavouriteUI = (props: ManageFavouritesProps) => {
    const { mcDispatch } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { width } = useWindowDimensions();
    const translateX = useSharedValue(0);
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const locationTextStyle = useAnimatedStyle(() => {
        const color = interpolateColor(translateX.value, [0, width / 2], ['#3D3C3E', '#7E7E7E']);
        return {
            color: color,
        };
    });

    const driversTextStyle = useAnimatedStyle(() => {
        const color = interpolateColor(translateX.value, [0, width / 2], ['#7E7E7E', '#3D3C3E']);
        return {
            color: color,
        };
    });

    return (
        <HardwareBackpressHandler onHardwareBackPress={() => props.mcDispatch({ type: 'GO_BACK', payload: undefined })}>
            <>
                <Header
                    title={userLanguageStrings.Favourites}
                    onBackPress={() => props.mcDispatch({ type: 'GO_BACK', payload: undefined })}
                    style={{ backgroundColor: homeSheetBg }}
                />
                <Animated.View style={[styles.mainContainer]}>
                    {featureFlags.enableDriverFavourite && (
                        <View style={styles.tabContainer}>
                            <View style={styles.tabButtonsContainer}>
                                <Pressable
                                    accessibilityRole="button"
                                    testID="location-tab-button"
                                    accessibilityLabel={'Location button'}
                                    style={styles.tabButton}
                                    onPress={() => {
                                        mcDispatch({ type: 'SET_ACTIVE_TAB', payload: 'Location' });
                                        translateX.value = withTiming(0, { duration: 300 });
                                    }}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            tailwind.style('font-areaNormal-extrabold'),
                                            locationTextStyle,
                                        ]}>
                                        {userLanguageStrings.Location}
                                    </Animated.Text>
                                </Pressable>
                                <Pressable
                                    accessibilityRole="button"
                                    testID="drivers-tab-button"
                                    accessibilityLabel={'Drivers button'}
                                    style={styles.tabButton}
                                    onPress={() => {
                                        mcDispatch({ type: 'SET_ACTIVE_TAB', payload: 'Drivers' });
                                        translateX.value = withTiming(width / 2, { duration: 300 });
                                    }}>
                                    <Animated.Text
                                        style={[
                                            styles.tabText,
                                            tailwind.style('font-areaNormal-extrabold'),
                                            driversTextStyle,
                                        ]}>
                                        {userLanguageStrings.Drivers}
                                    </Animated.Text>
                                </Pressable>
                            </View>
                            <View style={styles.indicatorTrack}>
                                <Animated.View style={[styles.indicator, { width: '50%' }, animatedIndicatorStyle]} />
                            </View>
                        </View>
                    )}
                    {featureFlags.enableDriverFavourite ? (
                        props.activeTab === 'Location' ? (
                            <LocationFavouriteFlow {...props} />
                        ) : (
                            <DriverFavouriteUI driversDeleteModalRef={props.driversDeleteModalRef} />
                        )
                    ) : (
                        <LocationFavouriteFlow {...props} />
                    )}
                </Animated.View>
            </>
        </HardwareBackpressHandler>
    );
};

export default ManageFavouriteUI;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: homeSheetBg,
    },
    tabContainer: {
        // Empty container for tab section
    },
    tabButtonsContainer: {
        flexDirection: 'row',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    tabText: {
        color: colors.gray450,
        fontSize: 15,
    },
    indicatorTrack: {
        height: 2,
        backgroundColor: colors.gray240,
    },
    indicator: {
        height: 2,
        backgroundColor: colors.gray450,
    },
});
