import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MultiModalRideEndAction, MultiTransitBottomScreenProps } from '../types';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import Animated, {
    FadeIn,
    FadeOut,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from 'react-native-reanimated';
import RatingsCard from '../components/RatingsCard';
import { Accordion } from '../components/Accordian';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '../../../../../src/typescript/components/Icon';
import { NarrowArrowRight } from '../../../components/svg/Arrows';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { createAction, createDispatcher, Resolver } from '@/typescript/utils/common';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import {
    frontendNotifyEventPostWithParams,
    useFrontendNotifyEventPostMutation,
} from '@/api/integrations/rtk/FrontendNotifyEventPost.ts';
import { journeyFeedBackForm } from '@/readOnly/api/types/JourneyFeedBackForm.gen.tsx';
import { useMultimodalJourneyIdJourneyFeedbackPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdJourneyFeedbackPost';
import { clearSession } from '@/typescript/state/client/session';
import { resetIdsAndPurge } from '@/typescript/state/sharedReducer.ts';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectToken } from '@/typescript/state/client/auth';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { setJourneyFeedBack, selectJourneyFeedBack, clearJourneyData } from '@/typescript/state/client/journey';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { clearAllMapSnapshots } from '@/src-v2/multimodal/utils/mapSnapshotUtils';
import { NativeModules } from 'react-native';

export const MultiTransitFeedbackBottomSheet: React.FC<MultiTransitBottomScreenProps> = props => {
    const { multiTransitFeedbackBottomSheetModalRef } = useRefsContext();
    const { handlers } = useScaleAnimation();
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const [ratingValue, setRatingValue] = useState<number | undefined>(props.initialRating);
    const [travelModeRate, setTravelModeRate] = useState<Record<number, boolean>>({});
    const [isAccordionOpen, setIsAccordionOpen] = useState(true);
    const [isJourneyRated, setIsJourneyRated] = useState(false);
    const [updateFrontendNotifyEvent] = useFrontendNotifyEventPostMutation();
    const [submitFeedbackApiCall] = useMultimodalJourneyIdJourneyFeedbackPostMutation();
    const [inputValue, setInputValue] = useState<string | undefined>(undefined);
    const [inputIsFocused, setInputIsFocused] = useState(false);
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const hasNavigated = useRef<boolean>(false);
    useEffect(() => {
        if (ratingValue) {
            setIsJourneyRated(true);
            if (ratingValue > 2 && ratingValue < 6) {
                setTravelModeRate(prevState => ({
                    ...prevState,
                    ...Object.fromEntries((props.transcitLegRating || []).map(item => [item.legOrder, true])),
                }));
            }
        }
    }, [ratingValue]);

    const handleRateTravelMode = useCallback((legOrder: number, isGoodExperience: boolean) => {
        setTravelModeRate(prev => ({
            ...prev,
            [legOrder]: isGoodExperience,
        }));
    }, []);

    const feedbackPresent = useAppSelector(state => selectJourneyFeedBack(state, props.journeyId));

    const feedbackReq: journeyFeedBackForm =
        feedbackPresent == null
            ? {
                  additionalFeedBack: inputValue,
                  rateTravelMode: props.legs.map(leg => ({
                      isExperienceGood: travelModeRate[leg.order],
                      legOrder: leg.order,
                      travelMode: leg.travelMode,
                      rating: ratingValue,
                  })),
                  rating: ratingValue,
              }
            : feedbackPresent;

    const handleSubmitFeedback = async (goToHomeScreen: boolean | undefined) => {
        if (!props.journeyId) return;
        const resp = await submitFeedbackApiCall({
            journeyId: props.journeyId,
            body: feedbackReq,
        });
        if (ratingValue && ratingValue >= 4) {
            const { AppRatings } = NativeModules;
            AppRatings.callAppRatings();
        }
        dispatch(setJourneyFeedBack({ id: props.journeyId, payload: feedbackReq }));
        if (resp.error) return;
        callClearSession();
        clearAllMapSnapshots();
        if (props.journeyId) {
            dispatch(clearJourneyData({ id: props.journeyId }));
        }
        if (!hasNavigated.current && goToHomeScreen) {
            navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
            hasNavigated.current = true;
        } else if (props.bookingDetailsFeedbackRef?.current) {
            props.bookingDetailsFeedbackRef.current.close();
        }
        if (ratingValue && props.onRatingSubmitted) {
            props.onRatingSubmitted(ratingValue);
        }
    };

    const callClearSession = useCallback(() => {
        dispatch(clearSession());
        resetIdsAndPurge(userToken, null, dispatch);
    }, []);

    const skipToHome = async () => {
        callClearSession();
        const ratingSkipEventReq: frontendNotifyEventPostWithParams = {
            body: { event: 'RATE_DRIVER_SKIPPED' },
        };
        try {
            await updateFrontendNotifyEvent(ratingSkipEventReq).unwrap();
            if (props.journeyId) {
                dispatch(clearJourneyData({ id: props.journeyId }));
            }
            if (!hasNavigated.current) {
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                hasNavigated.current = true;
            }
        } catch (err) {
            console.error('Profile Update Error:', err);
        }
    };

    const resolver: Resolver<MultiModalRideEndAction> = async action => {
        switch (action.type) {
            case 'SKIP_TO_HOME':
                skipToHome();
                break;
            case 'SUBMIT_FEEDBACK':
                handleSubmitFeedback(action.payload?.goToHomeScreen);
                break;
            case 'TOGGLE_RATING_STARS': {
                const newRating =
                    ratingValue === action.payload?.index ? (ratingValue ?? 1) - 1 : action.payload?.index;
                setRatingValue(newRating);
                if (newRating !== undefined) {
                    props.onRatingSubmitted(newRating);
                }
                break;
            }
            case 'RATE_TRAVEL_MODE':
                handleRateTravelMode(action.payload?.legOrder ?? 0, action.payload?.isGoodExperience ?? false);
                break;
            case 'ADDITIONAL_FEEDBACK':
                setInputValue(action.payload?.feedBackString);
                break;
            case 'ACCORDION_TOGGLE':
                setIsAccordionOpen(action.payload?.state ?? true);
                break;
            case 'INPUT_IS_FOCUSED':
                setInputIsFocused(true);
                break;
            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    };

    const mpDispatch = createDispatcher(resolver);

    const progressValue1 = useDerivedValue(() => {
        return withTiming(inputIsFocused ? 1 : 0);
    });

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');

    const animatedBorder = useAnimatedStyle(() => {
        const borderColor = interpolateColor(progressValue1.value, [0, 1], [`#F5F5F5`, `#4E5053`]);

        return {
            borderColor,
        };
    });

    return (
        <Animated.View>
            <Animated.View>
                <Animated.Text
                    style={tailwind.style(
                        `pt-5 pb-4 text-[#313131] text-center text-[16px] font-areaNormal-extrabold leading-[22px] tracking-[0.35px]`,
                    )}>
                    {userLanguageStrings.Rateyourjourneyexperience}
                </Animated.Text>
                <RatingsCard rating={feedbackPresent?.rating ?? ratingValue ?? 0} mpDispatch={mpDispatch} />
            </Animated.View>
            {isJourneyRated ? (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <Accordion
                        accordionState={isAccordionOpen}
                        mpDispatch={mpDispatch}
                        journeyItems={props.transcitLegRating ?? []}
                        bottomSheetModalRef={multiTransitFeedbackBottomSheetModalRef}
                        travelModeRate={
                            feedbackPresent?.rateTravelMode
                                ? Object.fromEntries(
                                      feedbackPresent.rateTravelMode.map(item => [
                                          item.legOrder,
                                          item.isExperienceGood ?? false,
                                      ]),
                                  )
                                : travelModeRate
                        }
                        editable={feedbackPresent?.rateTravelMode == null}
                    />
                    <Animated.View
                        style={[animatedBorder, tailwind.style('border mx-5 rounded-[16px] mt-5')]}
                        accessible={true}
                        accessibilityLabel="Additional feedback. Double tap to edit.">
                        <BottomSheetTextInput
                            onFocus={() => mpDispatch(createAction('INPUT_IS_FOCUSED', { state: true }))}
                            onBlur={() => mpDispatch(createAction('INPUT_IS_FOCUSED', { state: false }))}
                            placeholder={userLanguageStrings.AdditionalfeedbackOptional}
                            placeholderTextColor={'#7B7B7B'}
                            onChange={e =>
                                mpDispatch(createAction('ADDITIONAL_FEEDBACK', { feedBackString: e.nativeEvent.text }))
                            }
                            value={feedbackPresent?.additionalFeedBack ?? inputValue}
                            editable={feedbackPresent?.additionalFeedBack == null}
                            style={[
                                tailwind.style(
                                    `h-[50px]  p-4 text-[15px] text-[15px] font-areaNormal-semibold text-[#332D39]`,
                                ),
                                { textAlignVertical: 'top' },
                            ]}
                        />
                    </Animated.View>
                </Animated.View>
            ) : null}
            <Animated.View>
                {isJourneyRated ? (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Pressable
                            testID={`93fe7a9f-cd3c-4027-9388-9553777ed78c`}
                            onPress={() => {
                                mpDispatch(createAction('SUBMIT_FEEDBACK', { goToHomeScreen: !props.fromJourney }));
                            }}
                            {...handlers}
                            style={tailwind.style(`flex-row items-center justify-center mx-4`)}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Submit your feedback button">
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        `mt-8 flex w-full h-[48px] justify-center items-center px-3.5 py-[16.5px] rounded-[14px] bg-[${colors.Button_primary_default_fill_base}]`,
                                    ),
                                ]}>
                                <Animated.Text
                                    entering={FadeIn.delay(100)}
                                    exiting={FadeOut}
                                    style={tailwind.style(
                                        ` text-[15px] font-areaNormal-bold leading-[18px] tracking-[0.21px] text-[${colors.Button_Primary_Default_Text_Base}]`,
                                    )}>
                                    {userLanguageStrings.Submit}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                ) : null}
                {!props.fromJourney ? (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Pressable
                            accessibilityLabel="Skip to home button"
                            accessibilityRole="button"
                            testID={`951fdce4-b5d2-456d-93a3-fb6034599622`}
                            onPress={() => {
                                hapticEffect(HapticFeedbackTypes.effectTick, undefined);
                                mpDispatch(createAction('SKIP_TO_HOME', undefined));
                            }}
                            style={tailwind.style(`flex-row items-center justify-center pt-8`)}>
                            <Animated.Text
                                style={tailwind.style(
                                    `text-[#14171F] text-[15px] font-areaNormal-extrabold leading-[20px] tracking-[0.35px]`,
                                )}>
                                {userLanguageStrings.SkiptoHome}
                            </Animated.Text>
                            <Icon
                                icon={<NarrowArrowRight />}
                                size={16}
                                color="#14171F"
                                style={tailwind.style(`ml-1`)}
                            />
                        </Pressable>
                    </Animated.View>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
};
