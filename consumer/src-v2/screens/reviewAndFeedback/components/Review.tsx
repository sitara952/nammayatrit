import { createRideId } from '@/typescript/state/client/booking';
import { selectIsFavoriteWithId, selectRatingWithId, setIsFavorite } from '@/typescript/state/client/ride';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { Icon } from '@/typescript/components/Icon';
import FavoriteIcon from '@/typescript/components/svg/FavoriteIcon';
import colors from '@/typescript/designSystem/colorPalette';
// import Tag from '../../../designSystem/components/primitives/Tag';
import Tag from '@/typescript/designSystem/components/primitives/Tag';
// import Typography from '../../../designSystem/components/primitives/Typography';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
// import token from '../../../designSystem/tokens';
import token from '@/typescript/designSystem/tokens';
// import { tailwind } from '../../../tailwindTheme/tailwind';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import RatingDriverInfo from './RatingDriverInfo';
import RatingsComponent from './Ratings';
// import {useNavigation} from '@react-navigation/native';
import { selectFeatureFlags } from '@/typescript/state/client/session';
import { englishStrings } from 'config-types';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import DashedLine from '@/typescript/components/DashedLine';
import { CityAdImage } from '@/src-v2/components/CityAdImage';
import { AD_VIEW_UNIT_IDS } from '@/src-v2/components/CityAdImage/viewUnitIds';

type ReviewProps = {
    rateRide: (rating: number) => void;
    alternateNavigateToHome: (() => void) | undefined;
    bookingDetails: bookingAPIEntity | null;
};

const Review: React.FC<ReviewProps> = ({ rateRide, bookingDetails }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const dispatch = useAppDispatch();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const rideId = createRideId(bookingDetails?.rideList?.at(0)?.id ?? '');
    const rating = useAppSelector(state => selectRatingWithId(state, rideId));
    const rideDetails = bookingDetails?.rideList?.at(0);
    const isFavorite = useAppSelector(state => selectIsFavoriteWithId(state, rideId));
    const { bottom } = useSafeAreaInsets();
    const featureFlags = useAppSelector(selectFeatureFlags);
    const isAcRide = bookingDetails?.isAirConditioned ?? false;

    const driverName = rideDetails?.driverName ?? '';
    const vehicleVariant = bookingDetails?.serviceTierName ?? '';

    return (
        <Animated.View accessibilityViewIsModal={true} style={tailwind.style(`bg-[#FFFF] pb-[${bottom}px] rounded-xl`)}>
            {featureFlags?.showDriverDetailsInFeedback ? (
                <RatingDriverInfo
                    driverName={driverName}
                    vehicleVariant={vehicleVariant}
                    rideId={rideId}
                    isAcRide={isAcRide}
                    driverImage={rideDetails?.driverImage}
                />
            ) : null}
            <View style={tailwind.style('mx-5 mt-4')}>
                <DashedLine color={colors.primitive.gray[14]} />
                <View style={tailwind.style('flex-row justify-between items-center mb-2')}>
                    <Typography
                        type="subhead-800"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Rateyourride}
                    </Typography>
                </View>
                <RatingsComponent
                    rating={rating}
                    setRating={rateRide}
                    isInteractive={undefined} // Only allow rating changes if this is a new rating
                    clearSubmitApiData={undefined}
                />
                <DashedLine color={colors.primitive.gray[14]} />

                {/* Offer Image Component */}
                <CityAdImage
                    imageSource="reviewFeedback"
                    testID="review-offer-image"
                    viewUnitId={AD_VIEW_UNIT_IDS.REVIEW_FEEDBACK_BANNER}
                    containerStyle={tailwind.style('mt-4 mb-4')}
                    useAnimatedView={true}
                />
                {rating >= 4 && featureFlags.favouriteDriver ? (
                    <Animated.View style={tailwind.style('')}>
                        <Animated.View
                            accessibilityLabel={englishStrings.Favouritethisdriversothatwecanassignhimagain}
                            layout={LinearTransition}
                            style={tailwind.style('flex-row items-center justify-between py-6')}>
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[${token?.text?.['text-base']}] w-[80%]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Favouritethisdriversothatwecanassignhimagain}
                            </Typography>

                            <Tag
                                testID="review_feedback_favorite_driver"
                                type="secondary"
                                size="md"
                                style={tailwind.style(
                                    'h-10 w-13 justify-center items-center rounded-[22px]',
                                    isFavorite
                                        ? `bg-[${themeColors.Fill_redHigh}] border-[${themeColors.Fill_redHigh}]`
                                        : '',
                                )}
                                icon={
                                    <Icon
                                        size={16}
                                        icon={<FavoriteIcon fill={undefined} />}
                                        color={
                                            isFavorite
                                                ? colors?.primitive?.white?.[10]
                                                : token?.text?.['text-lowContrast']
                                        }
                                    />
                                }
                                onPress={() => dispatch(setIsFavorite({ id: rideId, payload: !isFavorite }))}
                            />
                        </Animated.View>
                    </Animated.View>
                ) : null}
            </View>

            {/* <Animated.View style={tailwind.style('px-4')}>
        <Button
          accessibilityLabel="Skip and close"
          text={userLanguageStrings.SkiptoHome}
          type="secondary-inverse"
          onPress={_ => {
            if (alternateNavigateToHome) {
              alternateNavigateToHome();
            } else {
              navigateToHome();
            }
          }}
        />
      </Animated.View> */}
        </Animated.View>
    );
};

export default Review;
