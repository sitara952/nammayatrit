import icMap from '@/typescript/assets/ic_map.webp';
import { Icon } from '@/typescript/components/Icon';
import NameInitials from '@/typescript/designSystem/components/NameInitials';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import React, { useEffect, useState } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import ArrowRight from '@/typescript/assets/svg/symbols/ArrowRight';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import TouchEffect from './TouchEffect';
import { followers } from '@/readOnly/api/types/Followers.gen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectFollowers, setCurrentFollower } from '@/typescript/state/client/user';
import { useGetBookingDetailsMutation } from '@/typescript/state/server/bookingApi';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectToken } from '@/typescript/state/client/auth';
import ActivityCard from '@/typescript/screens/home/homeComponents/homeScreenActivities/ActivityCard';

type FollowerWithItsBookingDetails = {
    follower: followers;
    title: string | undefined;
    description: string | undefined;
};

const nameInitialsBgColors = ['#F78118', '#A27DFE', '#FFD506', '#FF6666', '#00C49F', '#FF9F43'];

const SharedRides = () => {
    const { multipleSharedRidesRef } = useRefsContext();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const followers = useAppSelector(selectFollowers) ?? [];
    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [followersWithItsBookingDetails, setFollowersWithItsBookingDetails] = useState<
        FollowerWithItsBookingDetails[]
    >(
        followers.map(follower => ({
            follower,
            title: undefined,
            description: undefined,
        })),
    );
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);

    const multipleSharedRidesClick = async () => {
        multipleSharedRidesRef.current?.present();
        if (!dataFetched) {
            callAPIAndSetData();
        }
    };

    const followerClick = (follower: followers | null) => {
        multipleSharedRidesRef.current?.dismiss();
        dispatch(
            setCurrentFollower({
                id: userToken,
                payload: follower,
            }),
        );
        navigation.navigate('followRide', {
            defaultFollower: follower,
            shouldOpenChat: undefined,
        });
    };

    const callAPIAndSetData = async () => {
        // Only fetch if we haven't already or if the followers list has changed
        if (isLoading) return;
        setIsLoading(true);
        try {
            const updatedFollowers = await Promise.all(
                followers.map(async follower => {
                    const bookingDetailsResp = await fetchBookingDetails(follower.bookingId);

                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    const bookingDetails = bookingDetailsResp.data?._0 as bookingAPIEntity;
                    const destination =
                        bookingDetails?.bookingDetails.TAG === 'RENTAL'
                            ? bookingDetails?.bookingDetails._0.stopLocation
                            : bookingDetails?.bookingDetails._0.toLocation;

                    return {
                        follower,
                        title: destination?.area,
                        description: bookingDetails.estimatedDistance
                            ? `${(bookingDetails.estimatedDistance / 1000).toFixed(1)} km ride`
                            : undefined,
                    };
                }),
            );
            setFollowersWithItsBookingDetails(updatedFollowers);
            setDataFetched(true);
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dataFetched && followers.length > 0) {
            // Reset data fetched flag when followers change
            setDataFetched(false);
        }
    }, [followers]);

    if (followers.length === 0) {
        return null;
    }

    return (
        <View style={styles.flex1}>
            <PopUpModal
                sheetRef={multipleSharedRidesRef}
                handleComponent={null}
                stackBehavior="push"
                enableDynamicSizing={false}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={true}
                snapPoints={undefined}>
                <View style={styles.popupModalContainer}>
                    <Typography
                        type={'subhead-1'}
                        style={styles.popupModalTitle}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.followSharedRide}
                    </Typography>
                    <Typography
                        type={'body-1'}
                        style={styles.popupModalDesc}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.youHaveNRidesSharedWithYou(followers.length.toString())}
                    </Typography>
                    {followersWithItsBookingDetails.map((follower, index) => (
                        <SingleSharedRideDesc
                            style={{ marginTop: index === 0 ? 18 : 12, marginHorizontal: 16 }}
                            onPress={() => followerClick(follower.follower)}
                            follower={follower.follower}
                            destinationAdd={follower.title}
                            description={follower.description}
                            nameInitialStyle={[
                                styles.nameInitialsDimentions,
                                { backgroundColor: nameInitialsBgColors[index] ?? '#F78118' },
                            ]}
                        />
                    ))}
                </View>
            </PopUpModal>

            {followers.length === 1 && (
                <SingleSharedRide onPress={() => followerClick(followers.at(0) ?? null)} follower={followers.at(0)} />
            )}
            {followers.length > 1 && <MultipleSharedRides onPress={multipleSharedRidesClick} />}
        </View>
    );
};

const SingleSharedRide = ({
    onPress,
    follower,
}: {
    follower: followers | undefined;
    onPress: (() => void) | undefined;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    if (!follower || !follower.name) {
        return null;
    }
    return (
        <ActivityCard
            title={userLanguageStrings.followerHaveSharedRideWithYou(follower.name)}
            subtitle={undefined}
            onPress={onPress ?? (() => {})}
            testID="home_shared_rides_book_now"
            activityStatus="live"
            rightComponent={
                <Image
                    accessible={true}
                    accessibilityLabel="shared rides image"
                    source={icMap}
                    style={styles.image}
                    resizeMode="contain"
                />
            }
        />
    );
};

const MultipleSharedRides = ({ onPress }: { onPress: (() => void) | undefined }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <ActivityCard
            title={userLanguageStrings.multiplePeopleHaveSharedRideWithYou}
            subtitle={undefined}
            onPress={onPress ?? (() => {})}
            testID="home_shared_rides_view_all"
            activityStatus="live"
        />
    );
};

const SingleSharedRideDesc = ({
    onPress,
    style,
    follower,
    destinationAdd,
    description,
    nameInitialStyle,
}: {
    follower: followers;
    onPress: (() => void) | undefined;
    style: StyleProp<ViewStyle>;
    destinationAdd: string | undefined;
    description: string | undefined;
    nameInitialStyle: StyleProp<ViewStyle>;
}) => {
    if (!follower || !follower.name) return null;
    return (
        <TouchEffect
            testID="home_shared_rides_explore"
            style={[styles.container, styles.flex1_row, style]}
            effects={['scale']}
            onPress={onPress}
            accessible={undefined}
            accessibilityLabel={undefined}>
            <View style={styles.flex1}>
                <NameInitials
                    nameInitial={follower.name.charAt(0).toUpperCase()}
                    style={nameInitialStyle}
                    textStyle={undefined}
                />
                {destinationAdd ? (
                    <View style={[styles.flex1_row, styles.singleSharedDescTitleContiner]}>
                        <Typography
                            type={'subhead-1'}
                            style={styles.singleSharedDescTitle}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {follower.name}
                        </Typography>
                        <View style={styles.bridgeContainer}>
                            <Icon icon={<ArrowRight fill={'black'} bold={undefined} />} size={12} color={'black'} />
                        </View>
                        <Typography
                            type={'subhead-1'}
                            style={styles.singleSharedDescTitle}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {destinationAdd}
                        </Typography>
                    </View>
                ) : (
                    <ContentLoader width={200} height={20} style={{ marginTop: 6 }}>
                        <Rect x="0" y="0" rx="8" ry="8" width="200" height="20" />
                    </ContentLoader>
                )}
                {description ? (
                    <Typography
                        type={'sub-body-700'}
                        style={styles.description}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {description}
                    </Typography>
                ) : (
                    <ContentLoader width={100} height={20} style={{ marginTop: 6 }}>
                        <Rect x="0" y="0" rx="8" ry="8" width="100" height="20" />
                    </ContentLoader>
                )}
            </View>
            <Image
                accessible={true}
                accessibilityLabel="shared rides image"
                source={icMap}
                style={styles.imageBig}
                resizeMode="contain"
            />
        </TouchEffect>
    );
};

export default SharedRides;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        borderRadius: 16,
        padding: 12,
        marginHorizontal: 20,
        backgroundColor: 'white',
    },
    whiteBg: {
        backgroundColor: 'white',
    },
    image: {
        height: 50,
        width: 50,
        marginLeft: 10,
    },
    imageBig: {
        height: 70,
        width: 70,
        marginLeft: 10,
    },
    flex1_row: {
        flexDirection: 'row',
        flex: 1,
    },
    description: {
        color: '#78747C',
        marginTop: 6,
    },
    title: {
        color: '#2F2D32',
        maxWidth: 100,
    },
    bridgeContainer: {
        marginHorizontal: 6,
        justifyContent: 'center',
    },
    flex1: {
        flex: 1,
        marginBottom: 10,
    },
    center: {
        alignItems: 'center',
    },
    multiSharedTitle: {
        color: '#2F2D32',
        flex: 1,
    },
    singleSharedTitle: {
        color: '#2F2D32',
        flex: 1,
        marginTop: 7,
    },
    singleSharedDescTitleContiner: {
        marginTop: 6,
    },
    singleSharedDescTitle: {
        color: '#14171F',
        maxWidth: 100,
    },
    popupModalContainer: {
        paddingVertical: 24,
        backgroundColor: '#F8F8F8',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flex: 1,
        minHeight: 300,
    },
    popupModalTitle: {
        color: '#2F2D32',
        paddingHorizontal: 16,
    },
    popupModalDesc: {
        color: '#78747C',
        marginTop: 7,
        paddingHorizontal: 16,
    },
    nameInitials: {
        height: 30,
        width: 30,
        left: -10,
        borderWidth: 2,
        borderColor: 'white',
    },
    nameInitialsDimentions: {
        height: 30,
        width: 30,
    },
    nameInitialsText: {
        color: 'black',
    },
});
