import React, { useState, memo } from 'react';
import { Image, FlatList, View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { Header } from '../../primitives/Header';
import { DriverProfileViewProps } from './Types';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import HardwareBackpressHandler from '../../../src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import DriverReviewCard from './Components/DriverReview';
import PledgeContent from '@/typescript/designSystem/components/PledgeContent';

import DriverProfileGradient from './Components/DriverProfileGradient';
import DriverProfileShimmer from './Components/DriverProfileShimmer';
import { ViewStyleSheet } from './Stylesheet';
import { strings } from 'config-types';
import {
    calculateTimeWithNY,
    formatDate,
    mapFeedbackPillsToTags,
    truncateDriverName,
    isVehicleTypeCab,
} from './DriverProfileUtils';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName } from '@/typescript/state/client/session';

export const HeartIcon = () => (
    <Animated.View style={ViewStyleSheet._heartIconContainer}>
        <Typography
            type="body"
            style={ViewStyleSheet._heartIconText}
            numberOfLines={undefined}
            isAnimate={undefined}
            accessible={undefined}
            accessibilityLabel={undefined}
            accessibilityRole={undefined}>
            ❤️
        </Typography>
    </Animated.View>
);

// About Me Section Component
const AboutMeSection = memo(
    ({ aboutMe, userLanguageStrings }: { aboutMe: string | undefined; userLanguageStrings: strings }) => {
        const [showMore, setShowMore] = useState(false);

        if (!aboutMe) {
            return null;
        }

        return (
            <>
                <Typography
                    type="title-3"
                    style={ViewStyleSheet._sectionTitle}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.AboutMe}
                </Typography>
                <Typography
                    type="body"
                    style={ViewStyleSheet._detailsText}
                    numberOfLines={showMore ? undefined : 2}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {aboutMe}
                </Typography>

                <Pressable
                    accessibilityLabel={showMore ? 'Show more button' : 'Show less button'}
                    accessibilityRole="button"
                    testID="show-more-button"
                    style={ViewStyleSheet._showMoreText}
                    onPress={() => setShowMore(!showMore)}>
                    <Typography
                        type="body"
                        style={ViewStyleSheet._showMoreText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {showMore ? userLanguageStrings.ShowLess : userLanguageStrings.ShowMore}
                    </Typography>
                </Pressable>
            </>
        );
    },
);

const DriverProfileScreen: React.FC<DriverProfileViewProps> = (props: DriverProfileViewProps) => {
    const appReadableName = useAppSelector(selectAppReadableName);
    const { driverData, isLoading, userLanguageStrings, vehicleServiceType } = props;

    // Format languages array into string like "Kannada and Tamil"
    const formatLanguages = (languages: string[]): string | undefined => {
        if (!languages || languages.length === 0) return '';
        if (languages.length === 1) return languages[0];

        const lastLanguage = languages[languages.length - 1];
        const otherLanguages = languages.slice(0, -1).join(', ');
        return `${otherLanguages} and ${lastLanguage}`;
    };

    // Calculate time with Namma Yatri
    const timeWithNY = driverData?.onboardedAt
        ? calculateTimeWithNY(driverData.onboardedAt, userLanguageStrings)
        : { value: 3, unit: userLanguageStrings.years };

    if (isLoading) {
        return <DriverProfileShimmer onBackPress={props.onBackPress} />;
    }
    const formattedLanguages = driverData?.languages ? formatLanguages(driverData.languages) : '';

    return (
        <HardwareBackpressHandler>
            <DriverProfileGradient>
                <Header title="" onBackPress={props.onBackPress} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    contentContainerStyle={ViewStyleSheet._scrollViewContent}>
                    <Animated.View style={ViewStyleSheet._profileContainer}>
                        {/* Driver Avatar */}
                        <Animated.View style={ViewStyleSheet._avatarContainer}>
                            {driverData?.profileImage ? (
                                <Image
                                    accessible={true}
                                    accessibilityLabel="driver profile image"
                                    source={{ uri: `data:image/jpg;base64,${driverData.profileImage}` }}
                                    style={ViewStyleSheet._avatar}
                                />
                            ) : (
                                <Image
                                    accessible={true}
                                    accessibilityLabel="driver profile image"
                                    source={{ uri: props.driverDefaultProfileUri }}
                                    style={ViewStyleSheet._avatar}
                                />
                            )}
                        </Animated.View>

                        {/* Driver Name */}
                        <Typography
                            type="title-800"
                            style={ViewStyleSheet._driverName}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {driverData?.driverName}
                        </Typography>

                        {/* Endorsements */}
                        <Animated.View style={ViewStyleSheet._endorsementsContainer}>
                            <HeartIcon />
                            <Typography
                                type="body"
                                style={ViewStyleSheet._endorsementsText}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {driverData?.driverStats.likedByRidersNum} {userLanguageStrings.Endorsements}
                            </Typography>
                        </Animated.View>

                        {/* Stats Card */}
                        <Animated.View style={ViewStyleSheet._statsCard}>
                            <Animated.View style={ViewStyleSheet._statItem}>
                                <Typography
                                    type="title-3"
                                    style={ViewStyleSheet._statValue}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {driverData?.driverStats.numTrips.toLocaleString()}
                                </Typography>
                                <Typography
                                    type="body-1"
                                    style={ViewStyleSheet._statLabel}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.RidesSoFar}
                                </Typography>
                            </Animated.View>

                            <Animated.View style={ViewStyleSheet._divider} />

                            <Animated.View style={ViewStyleSheet._statItem}>
                                <Typography
                                    type="title-3"
                                    style={ViewStyleSheet._statValue}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {driverData?.driverStats.avgRating?.toFixed(1) || '-'}
                                </Typography>
                                <Typography
                                    type="body-1"
                                    style={ViewStyleSheet._statLabel}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Rating}
                                </Typography>
                            </Animated.View>

                            <Animated.View style={ViewStyleSheet._divider} />

                            <Animated.View style={ViewStyleSheet._statItem}>
                                <Typography
                                    type="title-3"
                                    style={ViewStyleSheet._statValue}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {driverData?.driverStats.cancellationRate}%
                                </Typography>
                                <Typography
                                    type="body-1"
                                    style={ViewStyleSheet._statLabel}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Cancellation}
                                </Typography>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>

                    {/* White Container extending to bottom */}
                    <Animated.View style={ViewStyleSheet._whiteContainer}>
                        <Animated.View style={ViewStyleSheet._personalDetails}>
                            {/* About Me Section */}
                            <AboutMeSection aboutMe={driverData?.aboutMe} userLanguageStrings={userLanguageStrings} />

                            {/* Languages */}
                            {driverData?.languages && driverData.languages.length > 0 && (
                                <Animated.View style={ViewStyleSheet._infoRow}>
                                    <Animated.View style={ViewStyleSheet._infoIcon}>
                                        <Typography
                                            type="body"
                                            style={undefined}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            🌍
                                        </Typography>
                                    </Animated.View>
                                    <Typography
                                        type="body"
                                        style={ViewStyleSheet._infoText}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.ISpeak(formattedLanguages ?? '')}
                                    </Typography>
                                </Animated.View>
                            )}

                            {/* Years with Namma Yatri */}
                            <Animated.View style={ViewStyleSheet._infoRow}>
                                <Animated.View style={ViewStyleSheet._infoIcon}>
                                    <Typography
                                        type="body"
                                        style={undefined}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        📅
                                    </Typography>
                                </Animated.View>
                                <Typography
                                    type="body"
                                    style={ViewStyleSheet._infoText}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.WithNammaYatriFor(
                                        appReadableName,
                                        timeWithNY.value,
                                        timeWithNY.unit,
                                    )}
                                </Typography>
                            </Animated.View>

                            {/* Vehicle Number */}
                            {driverData?.vehicleNum && (
                                <Animated.View style={ViewStyleSheet._infoRow}>
                                    <Animated.View style={ViewStyleSheet._infoIcon}>
                                        <Typography
                                            type="body"
                                            style={undefined}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            ℹ️
                                        </Typography>
                                    </Animated.View>
                                    <Typography
                                        type="body"
                                        style={ViewStyleSheet._infoText}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.VehicleNumber} {driverData.vehicleNum}
                                    </Typography>
                                </Animated.View>
                            )}
                        </Animated.View>

                        {/* Reviews List */}
                        {driverData?.topReviews && driverData.topReviews.length > 0 && (
                            <FlatList
                                data={driverData.topReviews}
                                keyExtractor={(_, idx) => idx.toString()}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <DriverReviewCard
                                        rating={item.rating ?? 0}
                                        reviewer={item.riderName ?? 'Anonymous'}
                                        date={formatDate(item.tripDate ?? '')}
                                        review={item.review ?? ''}
                                        tags={mapFeedbackPillsToTags(item.feedBackPills)}
                                    />
                                )}
                                scrollEnabled={true}
                            />
                        )}
                        <View>
                            <PledgeContent
                                driverAnimation={true}
                                pledgeText={userLanguageStrings.PromiseFromNammaYatriDriver}
                                isCab={isVehicleTypeCab(vehicleServiceType)}
                                isDriverProfile={true}
                                driverName={truncateDriverName(driverData?.driverName ?? '')}
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </DriverProfileGradient>
        </HardwareBackpressHandler>
    );
};

export default DriverProfileScreen;
