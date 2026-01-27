import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import {
    BottomSheetBackdrop,
    BottomSheetBackgroundProps,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useRef, useState } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransitSummaryChennaiOne } from '../../JourneyInfoScreen/components/TransitSummaryChennaiOne';
import { JourneyReviewCardProps } from '../types';
import { StarRating } from './StarRating';
import PublicTransportBadge from '@/src-v2/multimodal/components/svg/PublicTransportBadge';
import AutoDetailsBadge from '@/src-v2/multimodal/components/svg/AutoDetailsBadge';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { RightArrowIcon } from '@/src-v2/assets/svg/RightArrowIcon';

export const JourneyReviewCard = ({
    journeyLegs,
    totalJourneyCost,
    journeyTime,
    publicTransportCost,
    autoCost,
    tollCharges,
    surgeCharges,
    initialRating,
    onSubmitFeedback,
    onSkipToHome,
}: JourneyReviewCardProps) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { bottom } = useSafeAreaInsets();
    const [currentRating, setCurrentRating] = useState(initialRating || 0);
    const [feedbackText, setFeedbackText] = useState('');
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Scale animations for pressables
    const autoDetailsAnimation = useScaleAnimation();
    const submitButtonAnimation = useScaleAnimation();

    const renderBackdrop = useCallback(
        (props: BottomSheetBackgroundProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        ),
        [],
    );

    const handleRatingChange = useCallback(
        (rating: number) => {
            setCurrentRating(rating);
            bottomSheetModalRef?.current?.present();
        },
        [currentRating, bottomSheetModalRef],
    );

    const handleSubmitFeedback = useCallback(() => {
        if (onSubmitFeedback !== undefined) {
            onSubmitFeedback(currentRating, feedbackText);
        }
        bottomSheetModalRef?.current?.dismiss();
    }, [onSubmitFeedback, currentRating, feedbackText, bottomSheetModalRef]);

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(250)}
            style={tailwind.style('bg-white rounded-[16px] p-6 mt-4 mx-6')}>
            <Animated.View style={tailwind.style('')}>
                <Animated.View style={tailwind.style('pb-5')}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between w-full')}>
                        <Animated.View style={tailwind.style('flex-row items-center gap-2')}>
                            <PublicTransportBadge />
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[15px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C]',
                                )}>
                                {userLanguageStrings.PublicTransport}
                            </Animated.Text>
                        </Animated.View>
                        {!!publicTransportCost && (
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[15px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C]',
                                )}>
                                <Animated.Text style={tailwind.style('font-inter-semibold')}>₹</Animated.Text>
                                {publicTransportCost}
                            </Animated.Text>
                        )}
                    </Animated.View>
                    {!!autoCost && (
                        <Animated.View style={tailwind.style('flex-row items-center justify-between w-full pt-4')}>
                            <Pressable
                                testID="auto-details-button"
                                accessibilityLabel="Auto details button"
                                accessibilityRole="button"
                                onPress={() => bottomSheetModalRef?.current?.present()}
                                {...autoDetailsAnimation.handlers}>
                                <Animated.View
                                    style={[
                                        tailwind.style('flex-row items-center gap-2'),
                                        autoDetailsAnimation.animatedStyle,
                                    ]}>
                                    <AutoDetailsBadge />
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[15px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C]',
                                        )}>
                                        {userLanguageStrings.Auto}{' '}
                                        <Animated.Text style={tailwind.style('underline text-[#005FCB]')}>
                                            {userLanguageStrings.Details}
                                        </Animated.Text>
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[15px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C]',
                                )}>
                                <Animated.Text style={tailwind.style('font-inter-semibold')}>₹</Animated.Text>
                                {autoCost}
                            </Animated.Text>
                        </Animated.View>
                    )}
                </Animated.View>

                <Animated.View style={tailwind.style('h-[1px] bg-[#ECEDEF] mb-4')}></Animated.View>
                <StarRating rating={currentRating} onRatingChange={handleRatingChange} />
            </Animated.View>
            <BottomSheetModal
                backdropComponent={renderBackdrop}
                style={tailwind.style('bg-white rounded-[32px]')}
                handleComponent={null}
                ref={bottomSheetModalRef}
                enableDynamicSizing>
                <BottomSheetScrollView
                    style={tailwind.style('bg-white rounded-[32px]')}
                    contentContainerStyle={tailwind.style('bg-white pt-5', `pb-[${bottom ? bottom : 16}px]`)}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[15px] leading-[19px] font-areaNormal-extrabold text-[#656565] text-center',
                        )}>
                        {userLanguageStrings.JourneyDetails}
                    </Animated.Text>
                    <TransitSummaryChennaiOne
                        journey={journeyLegs}
                        type="alternate-colored"
                        fromJourneyCompleteScreen={true}
                    />
                    <Animated.View style={tailwind.style('mx-[28px] py-5 flex-row justify-between items-center')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#969696] w-[60%]',
                            )}>
                            {userLanguageStrings.YouReachedYourDestinationInJust(journeyTime)}
                        </Animated.Text>
                        <Animated.Text style={tailwind.style('text-[28px] leading-[36px] font-areaNormal-bold')}>
                            <Animated.Text style={tailwind.style('text-[14px] font-inter-semibold')}>₹ </Animated.Text>
                            {totalJourneyCost}
                        </Animated.Text>
                    </Animated.View>
                    {!!tollCharges && !!surgeCharges && (
                        <>
                            <Animated.View style={tailwind.style('h-[1px] bg-[#F4F4F4] mx-6')}></Animated.View>
                            <Animated.View style={tailwind.style('px-[28px] py-4')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[19px] font-areaNormal-extrabold text-[#656565]',
                                    )}>
                                    {userLanguageStrings.AdditionalCharges}
                                </Animated.Text>
                                <Animated.View style={tailwind.style('pt-2.5 gap-2')}>
                                    <Animated.View style={tailwind.style('flex-row justify-between items-center')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] leading-[19px] font-areaNormal-extrabold text-[#969696] tracking-[0.2px]',
                                            )}>
                                            {userLanguageStrings.Toll}
                                        </Animated.Text>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] leading-[19px] font-areaNormal-extrabold text-[#969696] tracking-[0.2px]',
                                            )}>
                                            <Animated.Text style={tailwind.style('font-inter-semibold')}>
                                                ₹
                                            </Animated.Text>
                                            {tollCharges}
                                        </Animated.Text>
                                    </Animated.View>
                                    <Animated.View style={tailwind.style('flex-row justify-between items-center')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] leading-[19px] font-areaNormal-extrabold text-[#969696] tracking-[0.2px]',
                                            )}>
                                            {userLanguageStrings.SurgeCharges}
                                        </Animated.Text>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] leading-[19px] font-areaNormal-extrabold text-[#969696] tracking-[0.2px]',
                                            )}>
                                            <Animated.Text style={tailwind.style('font-inter-semibold')}>
                                                ₹
                                            </Animated.Text>
                                            {surgeCharges}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
                        </>
                    )}
                    <Animated.View style={tailwind.style('h-[1px] bg-[#F4F4F4] mx-6')}></Animated.View>
                    <Animated.View style={tailwind.style('mt-4')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[15px] leading-[19px] font-areaNormal-extrabold text-[#656565] text-center',
                            )}>
                            {userLanguageStrings.RateYourJourney}
                        </Animated.Text>
                        <Animated.View style={tailwind.style('pt-5 px-6')}>
                            <StarRating rating={currentRating} onRatingChange={setCurrentRating} />
                            <Animated.View style={tailwind.style('mt-6')}>
                                <BottomSheetTextInput
                                    multiline={true}
                                    numberOfLines={4}
                                    placeholder="Additional feedback (Optional)"
                                    placeholderTextColor={'#CDCDCD'}
                                    style={tailwind.style(
                                        'text-[15px] leading-[19px] h-[80px] font-areaNormal-bold text-[#656565] border-[1px] border-[#ECEDEF] rounded-[14px] p-4',
                                    )}
                                    blurOnSubmit={true}
                                    onChangeText={setFeedbackText}
                                    defaultValue={feedbackText}
                                    onBlur={() => bottomSheetModalRef?.current?.collapse()}
                                />
                            </Animated.View>
                            <Animated.View style={tailwind.style('mt-4')}>
                                <Pressable
                                    accessibilityLabel="Submit feedback button"
                                    accessibilityRole="button"
                                    testID="submit-feedback-button"
                                    onPress={handleSubmitFeedback}
                                    {...submitButtonAnimation.handlers}>
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                'bg-[#047AEA] h-[56px] w-full flex-row justify-center items-center rounded-[16px] gap-2',
                                            ),
                                            submitButtonAnimation.animatedStyle,
                                        ]}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-white text-[16px] leading-[20px] tracking-[0.2px] font-areaNormal-extrabold',
                                            )}>
                                            {userLanguageStrings.Submit}
                                        </Animated.Text>
                                    </Animated.View>
                                </Pressable>
                            </Animated.View>
                            <Animated.View style={tailwind.style('mt-3')}>
                                <Pressable
                                    accessibilityRole="button"
                                    testID="skip-to-home-button"
                                    onPress={onSkipToHome}>
                                    <Animated.View
                                        style={tailwind.style(
                                            'h-[56px] w-full flex-row justify-center items-center rounded-[16px] gap-1',
                                        )}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[#3B3A3C] text-[16px] leading-[20px] tracking-[0.2px] font-areaNormal-extrabold pb-1',
                                            )}>
                                            {userLanguageStrings.SkiptoHome}
                                        </Animated.Text>
                                        <RightArrowIcon color={'#3B3A3C'} width={20} height={20} strokeWidth={2.0} />
                                    </Animated.View>
                                </Pressable>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                </BottomSheetScrollView>
            </BottomSheetModal>
        </Animated.View>
    );
};
