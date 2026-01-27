import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Platform } from 'react-native';
import { favouriteDriverResp } from '@/readOnly/api/types/FavouriteDriverResp.gen';
import { useDriverFavourite } from '@/typescript/hooks/useDriverFavourite';
import Svg, { Path, Rect } from 'react-native-svg';
import { HeartIcon } from '@/src-v2/screens/DriverProfile/UI';
import mt_driver_profile from '@/typescript/assets/ny-service/mt_driver_profile.webp';
import favourite_driver_logo from '@/typescript/assets/favourite_driver_logo.png';
import { FadeIn, FadeOut, SharedValue } from 'react-native-reanimated';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { DoubleActionModal } from '../components/DoubleActionModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Icon } from '@/typescript/components/Icon';
import { TrashIcon } from '../components/FavouritesToastMessages';
import ContentLoader from '@/typescript/designSystem/components/ContentLoader';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const DriverFavouriteUI = ({
    driversDeleteModalRef,
}: {
    driversDeleteModalRef: React.RefObject<BottomSheetModal | null>;
}) => {
    const { favoriteDrivers, error, isLoading, deleteDriver, isDeleting } = useDriverFavourite();
    const [selectedDriver, setSelectedDriver] = useState<favouriteDriverResp | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const handleViewProfile = useCallback(
        (driver: favouriteDriverResp) => {
            navigation.navigate('driverProfile', {
                driverId: driver.id,
                rideId: null,
                vehicleServiceType: undefined,
            });
        },
        [navigation],
    );

    const handleDeleteDriver = useCallback(
        (driver: favouriteDriverResp) => {
            setSelectedDriver(driver);
            driversDeleteModalRef.current?.present();
        },
        [driversDeleteModalRef],
    );

    return (
        <View style={styles.mainContainer}>
            <View style={styles.descriptionContainer}>
                {isLoading || isDeleting ? (
                    <View style={{ flex: 1, marginTop: 50 }}>
                        <DriverCardShimmer />
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={[styles.errorText, tailwind.style('font-areaNormal-bold')]}>
                            {userLanguageStrings.Somethingwentwrongpleasetryagainlater}
                        </Text>
                    </View>
                ) : !favoriteDrivers || favoriteDrivers.length === 0 ? (
                    <Animated.View style={styles.emptyContainer} entering={FadeIn}>
                        <Image
                            source={favourite_driver_logo}
                            style={styles.emptyImage}
                            accessible={true}
                            accessibilityLabel="favourite driver logo image"
                        />
                        <Text style={[styles.emptyText, tailwind.style('font-areaNormal-bold')]}>
                            {userLanguageStrings.Allthedriversumarkisfavouriteswillappearhere}
                        </Text>
                    </Animated.View>
                ) : (
                    <>
                        <Typography
                            type="callout-1"
                            style={styles.descriptionText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.YourMarkedFavouriteDriversAreListedBelow}
                        </Typography>
                        <FlatList
                            data={favoriteDrivers}
                            renderItem={({ item, index }) => (
                                <DriverCard
                                    driver={item}
                                    index={index}
                                    isLast={index === favoriteDrivers.length - 1}
                                    onViewProfile={handleViewProfile}
                                    onDelete={handleDeleteDriver}
                                />
                            )}
                            keyExtractor={item => item.id + item.driverName}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )}
            </View>
            {favoriteDrivers && favoriteDrivers.length > 0 ? <AnimatedSwipeHint /> : null}
            <DoubleActionModal
                title={userLanguageStrings.RemoveDriver}
                subtitle={userLanguageStrings.WellremoveitfromyourfavouritesYoucanadditagainifneeded}
                doubleActionModalRef={driversDeleteModalRef}
                onPrimaryAction={() => {
                    driversDeleteModalRef.current?.dismiss();
                }}
                onSecondaryAction={() => {
                    if (selectedDriver) {
                        driversDeleteModalRef.current?.dismiss();
                        deleteDriver(selectedDriver.id);
                    }
                }}
                primaryButtonText={userLanguageStrings.Cancel}
                secondaryButtonText={userLanguageStrings.Remove}
            />
        </View>
    );
};

export default DriverFavouriteUI;

const DriverCard = ({
    driver,
    index,
    isLast,
    onViewProfile,
    onDelete,
}: {
    driver: favouriteDriverResp;
    index: number;
    isLast: boolean;
    onViewProfile: (driver: favouriteDriverResp) => void;
    onDelete: (driver: favouriteDriverResp) => void;
}) => {
    const endorsements = driver.favCount;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { handlers, animatedStyle } = useScaleAnimation();
    const renderRightActions = useCallback(
        (_progress: SharedValue<number>, _translation: SharedValue<number>) => {
            return (
                <View style={[styles.swipeActionsContainer, isLast && styles.swipeActionsLastItem]}>
                    <Pressable
                        accessibilityRole="button"
                        testID={`profile-button-${index}`}
                        accessibilityLabel="Profile button"
                        onPress={() => onViewProfile(driver)}
                        style={styles.swipeActionButton}>
                        <Icon icon={<ProfileIcon fillColor={colors.green850} />} size={18} />
                        <Animated.Text style={[styles.swipeActionText, tailwind.style('font-areaNormal-extrabold')]}>
                            {userLanguageStrings.Profile}
                        </Animated.Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        testID={`delete-button-${index}`}
                        accessibilityLabel="Delete button"
                        onPress={() => onDelete(driver)}
                        style={styles.swipeActionButton}>
                        <Icon icon={<TrashIcon />} size={18} color={colors.red800} />
                        <Animated.Text style={[styles.swipeActionText, tailwind.style('font-areaNormal-extrabold')]}>
                            {userLanguageStrings.Delete}
                        </Animated.Text>
                    </Pressable>
                </View>
            );
        },
        [driver, index, isLast, onViewProfile, onDelete, userLanguageStrings],
    );

    return (
        <ReanimatedSwipeable
            overshootLeft={false}
            overshootRight={false}
            enableTrackpadTwoFingerGesture={true}
            friction={2}
            rightThreshold={40}
            renderRightActions={renderRightActions}>
            <Pressable
                testID={`driver-card-${index}`}
                onPress={() => onViewProfile(driver)}
                accessibilityLabel={driver.driverName + ' button'}
                accessibilityRole="button"
                {...handlers}>
                <Animated.View style={[driverCardStyles.cardContainer, animatedStyle]} entering={FadeIn.duration(200)}>
                    <View style={driverCardStyles.cardContent}>
                        <Image
                            source={mt_driver_profile}
                            style={driverCardStyles.driverImage}
                            accessible={true}
                            accessibilityLabel="driver profile image"
                        />
                        <View style={driverCardStyles.driverInfo}>
                            <Text style={[driverCardStyles.driverName, tailwind.style('font-areaNormal-extrabold')]}>
                                {driver.driverName}
                            </Text>
                            <View style={driverCardStyles.ratingContainer}>
                                <View style={driverCardStyles.ratingBadge}>
                                    <StarIcon />
                                    <Typography
                                        type="body-6"
                                        style={driverCardStyles.ratingText}
                                        numberOfLines={1}
                                        isAnimate={false}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {driver.driverRating.toFixed(1)}
                                    </Typography>
                                </View>
                                <View style={driverCardStyles.likesBadge}>
                                    <HeartIcon />
                                    <Typography
                                        type="body-6"
                                        style={driverCardStyles.likesText}
                                        numberOfLines={1}
                                        isAnimate={false}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {endorsements + ' ' + userLanguageStrings.Endorsements}
                                    </Typography>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </ReanimatedSwipeable>
    );
};

const ProfileIcon = ({ fillColor }: { fillColor: string }) => (
    <Svg width={15} height={15} viewBox="0 0 13 13" fill="none">
        <Path
            d="M7 1.75C8.52 1.75 9.75 2.98 9.75 4.5S8.52 7.25 7 7.25 4.25 6.02 4.25 4.5 5.48 1.75 7 1.75zM7 8.75c2.17 0 4.25 1.08 4.25 2.75v1.75H2.75V11.5c0-1.67 2.08-2.75 4.25-2.75z"
            fill={fillColor}
        />
    </Svg>
);

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        paddingHorizontal: 16,
    },
    errorText: {
        textAlign: 'center',
        fontFamily: 'areaNormal-extrabold',
        color: '#3B3A3C',
        fontSize: 15,
    },
    emptyContainer: {
        flex: 1,
        height: '100%',
        marginTop: 60,
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        paddingHorizontal: 16,
        gap: 16,
        width: '100%',
    },
    emptyImage: {
        width: 168,
        height: 140,
    },
    emptyText: {
        textAlign: 'center',
        fontFamily: 'areaNormal-extrabold',
        color: '#3B3A3C',
        fontSize: 15,
    },
    descriptionContainer: {
        margin: 16,
        flex: 1,
    },
    mainContainer: {
        flex: 1,
    },
    descriptionText: {
        textAlign: 'center',
        color: colors.gray560,
        marginBottom: 24,
    },
    swipeActionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 16,
    },
    swipeActionsLastItem: {
        marginBottom: 20,
    },
    swipeActionButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.gray140,
        borderRadius: 20,
        height: 80,
        width: 68,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        justifyContent: 'center',
        textAlign: 'center',
    },
    swipeActionText: {
        fontSize: 12,
        color: colors.gray300,
    },
});

const driverCardStyles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.neutral300,
    },
    cardContent: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverImage: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 16,
    },
    driverInfo: {
        flex: 1,
    },
    driverName: {
        color: colors.gray450,
        fontSize: 15,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray140,
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 2,
        gap: 4,
    },
    ratingText: {
        color: colors.gray600,
    },
    likesBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 9999,
        paddingLeft: 8,
        paddingRight: 12,
        paddingVertical: 2,
        gap: 4,
    },
    likesText: {
        color: colors.gray600,
    },
});

export const DriverCardShimmer = () => {
    return (
        <View style={styles.mainContainer}>
            {[1, 2, 3].map(item => (
                <ContentLoader key={item} height={80} style={{ marginBottom: 16 }}>
                    {/* Card background */}
                    <Rect x="0" y="0" rx="16" ry="16" width="100%" height="100%" />
                    {/* Driver image circle */}
                    <Rect x="18" y="14" rx="26" ry="26" width="52" height="52" />
                    {/* Driver name */}
                    <Rect x="86" y="18" rx="4" ry="4" width="120" height="16" />
                    {/* Rating badge */}
                    <Rect x="86" y="42" rx="12" ry="12" width="60" height="24" />
                    {/* Likes badge */}
                    <Rect x="158" y="42" rx="12" ry="12" width="100" height="24" />
                </ContentLoader>
            ))}
        </View>
    );
};

export const StarIcon = () => (
    <Svg width={16} height={16} viewBox="0 1 19 16" fill="none">
        <Path
            d="M8 1.5l2.472 5.007L16 7.25l-4 3.9.944 5.525L8 14.325l-4.944 2.35L4 11.15l-4-3.9 5.528-.743L8 1.5z"
            fill="#FBBF24"
        />
    </Svg>
);

export const AnimatedSwipeHint = () => {
    const translateX = useSharedValue(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    useEffect(() => {
        translateX.value = withRepeat(
            withSequence(withTiming(-5, { duration: 500 }), withTiming(0, { duration: 500 })),
            -1,
            true,
        );
    }, []);

    const arrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));
    const { bottom } = useSafeAreaInsets();

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                gap: 10,
                width: '100%',
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 16 : bottom,
            }}>
            <Animated.Text
                style={[
                    tailwind.style('font-areaNormal-extrabold'),
                    { color: colors.gray64, fontSize: 18, marginBottom: 2 },
                    arrowStyle,
                ]}>
                {'<<'}
            </Animated.Text>
            <Animated.Text
                style={[tailwind.style('font-areaNormal-extrabold'), { color: colors.gray64, fontSize: 12 }]}>
                {userLanguageStrings.SwipeLeftOnCardForActions}
            </Animated.Text>
        </Animated.View>
    );
};
