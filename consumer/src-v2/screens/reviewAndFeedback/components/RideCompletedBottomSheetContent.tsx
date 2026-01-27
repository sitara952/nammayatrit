import {
    selectFeedbackWithId,
    selectIsDangerWithId,
    selectIsFavoriteWithId,
    selectRatingWithId,
    selectSubmitApiDataWithId,
    setFeedback,
    setIsDanger,
    setIsFavorite,
    setRating,
    setSubmitApiData,
} from '@/typescript/state/client/ride';
import { selectFeatureFlags, selectUserLanguage } from '@/typescript/state/client/session';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, { useEffect } from 'react';
import { StyleSheet, Text, Image } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useSharedValue, withSpring } from 'react-native-reanimated';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { Icon } from '@/typescript/components/Icon';
import BlockIcon from '@/typescript/components/svg/BlockIcon';
import { CityAdImage } from '@/src-v2/components/CityAdImage';
import { AD_VIEW_UNIT_IDS } from '@/src-v2/components/CityAdImage/viewUnitIds';
import ny_ic_red_filled_white_heart from '@/typescript/assets/ny_ic_red_filled_white_heart.webp';
import ny_ic_grey_heart_with_outline from '@/typescript/assets/ny_ic_grey_heart_with_outline.webp';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import Tag from '@/typescript/designSystem/components/primitives/Tag';
import TextArea from '@/typescript/designSystem/components/primitives/TextArea';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { createRideId } from '@/typescript/state/client/booking';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import RatingDriverInfo from './RatingDriverInfo';
import RatingsComponent from './Ratings';
import { FeatureFlags } from '@/src-v2/systems/configs/types';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import colors from '@/typescript/designSystem/colorPalette/';
import { truncateDriverName } from '@/src-v2/utils/common';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useFeedbackFormGetQuery } from '@/api/integrations/rtk/FeedbackFormGet';
import type { feedbackFormAPIEntity } from '@/readOnly/api/types/FeedbackFormAPIEntity.gen';
import type { feedbackFormItem, badgeItem, translationItem } from '@/readOnly/api/types/FeedbackFormItem.gen';
import type { Language_language } from '@/readOnly/api/types/Enums.gen';

const getTranslatedText = (
    translations: Array<{ language: string; translation: string }> | undefined,
    fallbackContent: string,
    currentLanguage: Language_language,
): string => {
    const translation = translations?.find(t => t.language === currentLanguage);
    return translation?.translation || fallbackContent;
};

export const buildFeedbackArray = (submitApiData: Array<{ id: string; question: string; questionId: string }>) => {
    const groupedByQuestion = submitApiData.reduce<Record<string, string[]>>((acc, item) => {
        if (item.questionId && item.id) {
            const existingArray = acc[item.questionId] || [];
            return {
                ...acc,
                [item.questionId]: [...existingArray, item.id],
            };
        }
        return acc;
    }, {});

    return Object.entries(groupedByQuestion).map(([questionId, badgeKeys]) => ({
        questionId,
        answer: badgeKeys,
    }));
};

export const buildFeedbackSubmissionPayload = (
    rideId: string,
    rating: number,
    feedbackDetails: string,
    submitApiData: Array<{ id: string; question: string; questionId: string }>,
) => {
    return {
        rideId,
        rating,
        feedbackDetails: feedbackDetails || '',
        feedbackAnswers: buildFeedbackArray(submitApiData),
    };
};

type RideCompletedBottomSheetContentTypes = {
    showBlacklist: boolean | undefined;
    bookingDetails: bookingAPIEntity | null;
    alternateNavigateToHome: (() => void) | undefined;
    onSubmit: ((rating: number) => void) | undefined;
    bookingDetailsFeedbackRef: React.RefObject<BottomSheetModalMethods | null> | undefined;
    initiallyFavorite: boolean;
    setinitiallyFavorite: (val: boolean) => void;
};

const RideCompletedBottomSheetContent = ({
    showBlacklist = false,
    bookingDetails,
    bookingDetailsFeedbackRef,
    initiallyFavorite,
    setinitiallyFavorite,
}: RideCompletedBottomSheetContentTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const currentLanguage: Language_language = useAppSelector(selectUserLanguage) ?? 'ENGLISH';
    const rideId = createRideId(bookingDetails?.rideList?.at(0)?.id ?? '');
    const rideDetails = bookingDetails?.rideList?.at(0);
    const rating = useAppSelector(state => selectRatingWithId(state, rideId));
    const submitApiData = useAppSelector(state => selectSubmitApiDataWithId(state, rideId));
    const isFavorite = useAppSelector(state => selectIsFavoriteWithId(state, rideId));
    const isDanger = useAppSelector(state => selectIsDangerWithId(state, rideId));
    const feedback = useAppSelector(state => selectFeedbackWithId(state, rideId));
    const featureFlags: FeatureFlags = useAppSelector(selectFeatureFlags);
    const dispatch = useAppDispatch();

    const { data: feedbackFormData } = useFeedbackFormGetQuery();

    const currentRatingData: feedbackFormAPIEntity | undefined = feedbackFormData?._data?.find(
        (item: feedbackFormAPIEntity) => item.rating === rating,
    );
    const currentRatingQuestions: feedbackFormItem[] = [...(currentRatingData?.questions || [])].sort((a, b) => {
        const isOtherQuestion = (question: feedbackFormItem): boolean => {
            const questionText = question.question.toLowerCase();
            if (questionText.includes('other') || questionText === 'other') {
                return true;
            }
            return (
                question.questionTranslations?.some(
                    (trans: translationItem) =>
                        trans.translation.toLowerCase().includes('other') ||
                        trans.translation.toLowerCase() === 'other',
                ) ?? false
            );
        };

        const aIsOther = isOtherQuestion(a);
        const bIsOther = isOtherQuestion(b);

        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;
        return 0;
    });

    const scale = useSharedValue(1);

    const handlePress = () => {
        scale.value = withSpring(1.3, { damping: 4, stiffness: 200 }, () => {
            scale.value = withSpring(1);
        });
        setinitiallyFavorite(!initiallyFavorite);
    };

    useEffect(() => {
        setinitiallyFavorite(isFavorite);
    }, []);

    useEffect(() => {
        return () => {
            bookingDetailsFeedbackRef?.current?.close();
        };
    }, []);

    const driverName = rideDetails?.driverName ?? '';
    const truncatedDriverName = truncateDriverName(driverName);
    const vehicleVariant = bookingDetails?.serviceTierName ?? '';

    useEffect(() => {
        if (rating >= 4) {
            dispatch(setIsDanger({ id: rideId, payload: false }));
        }
        if (rating < 4) {
            dispatch(setIsFavorite({ id: rideId, payload: false }));
        }
    }, [rating]);
    const isAcRide = bookingDetails?.isAirConditioned ?? false;

    const { bottom } = useSafeAreaInsets();

    const styles = StyleSheet.create({
        container: {
            paddingBottom: bottom - 10,
            borderRadius: 24,
        },
        ratingTitle: {
            fontSize: 16,
            lineHeight: 24,
            fontFamily: 'AreaNormal-Extrabold',
        },
        ratingTitleContainer: {
            paddingHorizontal: 24,
            paddingTop: 24,
        },
        favouriteDriverContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 20,
            paddingHorizontal: 16,
        },
        favouriteDriverText: {
            width: '60%',
            fontFamily: 'areaNormal-extrabold',
            color: colors.primitive.gray[17],
            fontSize: 15,
        },
        favouriteHeartContainer: {
            width: 52,
            height: 52,
            justifyContent: 'center',
            alignItems: 'center',
        },
        favouriteHeartImage: {
            width: 54,
            height: isFavorite ? 42.3 : 41.5,
        },
        feedbackTypeText: {
            fontFamily: 'AreaNormal-Bold',
            fontSize: 14,
            lineHeight: 20,
            color: colors.primitive.gray[17],
        },
        feedbackTagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            rowGap: 16,
        },
        blacklistContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        blacklistText: {
            width: '80%',
        },
    });

    return (
        <Animated.View layout={LinearTransition} style={styles.container}>
            <Animated.View layout={LinearTransition.springify().damping(24).stiffness(200)}>
                {featureFlags.showDriverDetailsInFeedback ? (
                    <RatingDriverInfo
                        driverName={truncatedDriverName}
                        vehicleVariant={vehicleVariant}
                        rideId={rideId}
                        isAcRide={isAcRide}
                        driverImage={rideDetails?.driverImage}
                    />
                ) : (
                    <Text style={[styles.ratingTitle, styles.ratingTitleContainer]}>
                        {featureFlags.showDriverDetailsInFeedback
                            ? userLanguageStrings.Rateyourride
                            : userLanguageStrings.RateyourBooking}
                    </Text>
                )}

                <Animated.View style={tailwind.style(`py-3`)}>
                    <RatingsComponent
                        rating={rating}
                        setRating={rating => dispatch(setRating({ id: rideId, payload: rating }))}
                        clearSubmitApiData={() => dispatch(setSubmitApiData({ id: rideId, payload: [] }))}
                        isInteractive={undefined}
                    />
                </Animated.View>

                {/* Offer Image Component */}
                <CityAdImage
                    imageSource="reviewFeedback"
                    testID="feedback-offer-image"
                    viewUnitId={AD_VIEW_UNIT_IDS.RIDE_COMPLETED_FEEDBACK_BANNER}
                    containerStyle={tailwind.style('mx-4 mt-4 mb-4')}
                    useAnimatedView={true}
                />

                {rating >= 4 && featureFlags.favouriteDriver ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={tailwind.style(`px-[${token?.spacing?.[10]}]`)}>
                        <Divider
                            type="dashed"
                            direction={undefined}
                            style={undefined}
                            labelPosition={undefined}
                            offset={undefined}
                            offsetBackground={undefined}
                            dividerColor={undefined}
                            strokeDashArray={undefined}
                        />
                    </Animated.View>
                ) : null}

                {rating >= 4 && featureFlags.favouriteDriver ? (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(400)}
                        layout={LinearTransition.springify().damping(24).stiffness(200)}
                        style={styles.favouriteDriverContainer}>
                        <Typography
                            type="subhead-1"
                            style={styles.favouriteDriverText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {isFavorite
                                ? userLanguageStrings.DriverAlreadyFavourited
                                : userLanguageStrings.Favouritethisdriversothatwecanassignhimagain}
                        </Typography>
                        <Pressable
                            testID={`3504291b-03432-482b-b5d1-78f82887c52a`}
                            accessibilityRole="button"
                            onPress={handlePress}
                            accessibilityLabel="Click here to Favourite this driver button"
                            disabled={isFavorite}>
                            <Animated.View
                                style={[styles.favouriteHeartContainer, { transform: [{ scale }] }]}
                                accessible={true}
                                accessibilityLabel={'Click here to Favourite this driver'}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="favourite heart"
                                    style={styles.favouriteHeartImage}
                                    source={
                                        isFavorite || initiallyFavorite
                                            ? ny_ic_red_filled_white_heart
                                            : ny_ic_grey_heart_with_outline
                                    }
                                />
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                ) : null}
            </Animated.View>

            <Animated.View
                layout={LinearTransition}
                style={tailwind.style(`flex-col bg-[#F8F9FB]  gap-[${token?.gap?.spacing?.[16]}] py-5 pb-20`)}>
                {rating
                    ? currentRatingQuestions?.map((questionObj: feedbackFormItem, questionIndex: number) => (
                          <Animated.View
                              key={`${rating}-${questionObj.questionId}`}
                              entering={FadeIn}
                              exiting={FadeOut}
                              style={tailwind.style(questionIndex > 0 ? 'mt-4' : '')}>
                              <Typography
                                  type="body-7"
                                  isAnimate
                                  style={[styles.feedbackTypeText, tailwind.style(`px-[${token?.spacing?.[16]}]`)]}
                                  numberOfLines={undefined}
                                  accessible={undefined}
                                  accessibilityLabel={undefined}
                                  accessibilityRole={undefined}>
                                  {getTranslatedText(
                                      questionObj.questionTranslations,
                                      questionObj.question,
                                      currentLanguage,
                                  )}
                              </Typography>

                              <Animated.View
                                  style={[
                                      styles.feedbackTagsContainer,
                                      tailwind.style(`px-[${token?.spacing?.[16]}] mt-2`),
                                  ]}
                                  pointerEvents="box-none">
                                  {questionObj.badges?.map((badge: badgeItem, badgeIndex: number) => {
                                      const englishTranslation =
                                          badge.translations?.find(t => t.language === 'ENGLISH')?.translation ||
                                          badge.key;
                                      const badgeText = getTranslatedText(
                                          badge.translations,
                                          englishTranslation,
                                          currentLanguage,
                                      );
                                      return (
                                          <Tag
                                              key={badge.key}
                                              testID={`review_feedback_badge_tag_${questionIndex}_${badgeIndex}_${badge.key
                                                  ?.toLowerCase()
                                                  .replace(/\s+/g, '_')}`}
                                              type="primary"
                                              size="md"
                                              text={badgeText}
                                              selected={submitApiData.some(
                                                  submitItem =>
                                                      submitItem.id === badge.key &&
                                                      submitItem.questionId === questionObj.questionId,
                                              )}
                                              accessibilityState={{
                                                  selected: submitApiData.some(
                                                      submitItem =>
                                                          submitItem.id === badge.key &&
                                                          submitItem.questionId === questionObj.questionId,
                                                  ),
                                              }}
                                              onPress={() => {
                                                  const isSelected = submitApiData.some(
                                                      submitItem =>
                                                          submitItem.id === badge.key &&
                                                          submitItem.questionId === questionObj.questionId,
                                                  );

                                                  if (isSelected) {
                                                      dispatch(
                                                          setSubmitApiData({
                                                              id: rideId,
                                                              payload: submitApiData.filter(
                                                                  submitItem =>
                                                                      !(
                                                                          submitItem.id === badge.key &&
                                                                          submitItem.questionId ===
                                                                              questionObj.questionId
                                                                      ),
                                                              ),
                                                          }),
                                                      );
                                                  } else {
                                                      dispatch(
                                                          setSubmitApiData({
                                                              id: rideId,
                                                              payload: [
                                                                  ...submitApiData,
                                                                  {
                                                                      id: badge.key,
                                                                      question: badgeText,
                                                                      questionId: questionObj.questionId,
                                                                  },
                                                              ],
                                                          }),
                                                      );
                                                  }
                                              }}
                                          />
                                      );
                                  })}
                              </Animated.View>
                          </Animated.View>
                      ))
                    : null}

                <Animated.View layout={LinearTransition} style={tailwind.style(`px-[${token?.spacing?.default}]`)}>
                    <TextArea
                        type={rating > 3 ? 'primary' : 'secondary'}
                        placeholder={
                            rating > 3
                                ? userLanguageStrings.AdditionalfeedbackOptional
                                : userLanguageStrings.Whatwentwrong_QuestionMark
                        }
                        size="xl"
                        value={feedback}
                        onChangeText={text => dispatch(setFeedback({ id: rideId, payload: text }))} //Change
                        prefix={undefined}
                        suffix={undefined}
                        containerStyle={undefined}
                    />
                </Animated.View>

                {rating < 4 && showBlacklist ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={[styles.blacklistContainer, tailwind.style(`px-[${token?.spacing?.[16]}]`)]}>
                        <Typography
                            type="body-1"
                            style={styles.blacklistText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.BlacklistthedriverWedontassignthisdriveragain}
                        </Typography>

                        <Tag
                            testID="review_feedback_blacklist_driver"
                            type="secondary"
                            size="md"
                            style={tailwind.style(isDanger ? `bg-[${themeColors.Fill_negativeHigh}]` : '')}
                            icon={
                                <Icon
                                    icon={<BlockIcon fill={undefined} />}
                                    size={16}
                                    color={isDanger ? themeColors.Fill_neutralMin : token?.text?.['text-lowContrast']}
                                />
                            }
                            onPress={() => dispatch(setIsDanger({ id: rideId, payload: !isDanger }))}
                        />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
};

export default RideCompletedBottomSheetContent;
