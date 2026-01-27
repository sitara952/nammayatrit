import React, { useEffect, useRef } from 'react';
import Animated, { FlipInXDown, FlipOutXUp, useSharedValue, withTiming } from 'react-native-reanimated';
import { View, Image, Platform } from 'react-native';

import CardBoostSearchInfo from './BoostSearchInfo/Flow.tsx';
import { Easing } from 'react-native-reanimated';
import { useRideSearchTextFlipper } from '../../hooks/useAnimationFlipper.tsx';
import Typography from '@/typescript/designSystem/components/primitives/Typography.tsx';

import { LookingForRidesUIProps } from './Types.ts';

import { ProgressBar } from '@/typescript/components/ProgressBar.tsx';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import {
    selectIsEditClicked,
    selectPersistedTipOptions,
    selectPricingItems,
} from '@/typescript/state/client/search.ts';

import { BoostCard } from './BoostCard/Flow.tsx';

import { TiltedArrow } from '@/typescript/assets/svg/symbols/TiltedArrow.tsx';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import overlayImage from '@/typescript/assets/ny_ic_flash_icon.webp';
import { events, EventType } from '@/src-v2/systems/events/events.ts';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Button from '@/src-v2/primitives/Button.tsx';
import { createAction } from '@/typescript/utils/common.ts';
import { latLong } from '@/readOnly/api/types/LatLong.gen.tsx';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext.tsx';
import useOnBottomSheetAnimate from '@/typescript/hooks/useOnBottomSheetAnimate.tsx';
import { selectNewFeatureFlags } from '@/typescript/state/client/session.ts';
import { getPersistedTipOptions } from '@/src-v2/utils/common.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';

const LookingForRides = ({
    displayTitle,
    isSearchBoosted,
    progressRef,
    additionalFare,
    setAdditionalFare,
    selectedExpandedData,
    setSelectedExpandedData,
    buttonText,
    isDisabled,
    searchCentre,
    rcsDispatch,
    showBoostInfo,
    setHeight,
    updateInitialSelectedVehicles,
    fareDisplay,
}: LookingForRidesUIProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const isEditClicked = useAppSelector(state => selectIsEditClicked(state, null));
    const { bottom } = useSafeAreaInsets();
    const { sheetAnimatedPosition } = useAnimatedContextValues(undefined);
    useOnBottomSheetAnimate(
        sheetAnimatedPosition,
        useRef(true),
        {
            left: undefined,
            right: undefined,
            top: undefined,
            bottom: Platform.OS === 'ios' ? 55 : 45,
        },
        false,
    );

    const shouldShowDefaultTips = useAppSelector(selectNewFeatureFlags).shouldShowDefaultTips;
    const allPricingItems = useAppSelector(state => selectPricingItems(state, null));
    const persistedTipOptions = useAppSelector(state => selectPersistedTipOptions(state, null));

    const tipOptions = getPersistedTipOptions(
        persistedTipOptions,
        selectedExpandedData,
        allPricingItems,
        shouldShowDefaultTips,
    );

    return (
        <View style={{ backgroundColor: colors?.white100 }}>
            <BottomSheetScrollView
                contentContainerStyle={{ paddingBottom: isSearchBoosted && !isEditClicked ? 0 : 60 }}
                scrollEnabled={showBoostInfo}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 20 }}>
                    {isSearchBoosted ? <BoostedImage /> : null}
                    <TitleSubtitle subtitle={displayTitle} searchCentre={searchCentre} />
                    <ProgressBar
                        containerStyle={{
                            marginTop: 8,
                        }}
                        animatedProgressRef={progressRef}
                        fillColor={'#58545D'}
                        unFillColor={'#F0F0F0'}
                        style={{ marginHorizontal: 20 }}
                        useGradient={isSearchBoosted ? true : false}
                        gradient={['#FFD847', '#F78118']}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: 16,
                            paddingHorizontal: 10,
                            marginTop: 8,
                            marginBottom: isSearchBoosted ? 24 : bottom - (Platform.OS === 'ios' ? 10 : -10),
                        }}>
                        <Typography
                            type="subhead-800"
                            style={{
                                color: '#5B6777',
                                fontSize: 16,
                                fontWeight: '800',
                            }}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.RideFare}
                        </Typography>
                        <Typography
                            type="subhead-800"
                            style={{
                                color: '#5B6777',
                                fontSize: 16,
                                fontWeight: '800',
                            }}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={`${userLanguageStrings.RideFare} ${fareDisplay}`}
                            accessibilityRole={undefined}>
                            {fareDisplay}
                        </Typography>
                    </View>
                </View>
                {showBoostInfo ? (
                    <View style={{ paddingHorizontal: 20 }}>
                        {!isSearchBoosted || isEditClicked ? (
                            <BoostCard
                                containerStyle={{ marginBottom: bottom }}
                                additionalFare={additionalFare}
                                setAdditionalFare={setAdditionalFare}
                                selectedExpandedData={selectedExpandedData}
                                setSelectedExpandedData={setSelectedExpandedData}
                                setHeight={setHeight}
                                updateInitialSelectedVehicles={updateInitialSelectedVehicles}
                                tipOptions={tipOptions}
                                currentlySelectedIds={selectedExpandedData}
                            />
                        ) : null}
                        {isSearchBoosted && !isEditClicked ? <CardBoostSearchInfo containerStyle={{}} /> : null}
                    </View>
                ) : null}
            </BottomSheetScrollView>
            {(showBoostInfo && !isSearchBoosted) || isEditClicked ? (
                <View
                    style={{
                        width: '100%',
                        paddingTop: 14,
                        zIndex: 5,
                        position: 'absolute',
                        bottom: bottom,
                        paddingHorizontal: 20,
                    }}>
                    <Button
                        testID="looking_for_rides_boost_click"
                        type="primary"
                        style={{ justifyContent: 'center' }}
                        text={buttonText}
                        disabled={isDisabled}
                        onPress={() => rcsDispatch(createAction('BUTTON_CLICKED', undefined))}
                    />
                </View>
            ) : null}
        </View>
    );
};

const TitleSubtitle = ({ subtitle }: { subtitle: string | undefined; searchCentre: latLong }) => {
    const { visibleText } = useRideSearchTextFlipper();
    const flipValue = useSharedValue(0);

    useEffect(() => {
        flipValue.value = 0;
        flipValue.value = withTiming(1, { duration: 600 });
    }, [visibleText]);

    useEffect(() => {
        events.markFirstScreenRender(EventType.ON_CREATE_TO_LOOKING_FOR_RIDES);
    }, []);

    return (
        <Animated.View
            style={{
                gap: 6,
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 6,
                marginBottom: 10,
                marginHorizontal: 50,
            }}>
            <Animated.View
                entering={FlipInXDown.duration(200).easing(Easing.inOut(Easing.quad))}
                exiting={FlipOutXUp.duration(200).easing(Easing.inOut(Easing.quad))}
                key={visibleText}
                style={{
                    backfaceVisibility: 'hidden',
                    transform: [{ perspective: 1000 }],
                    height: 55,
                    justifyContent: 'center',
                }}>
                <Typography
                    type="callout"
                    style={{ fontSize: 20, textAlign: 'center', paddingTop: 5, lineHeight: 23 }}
                    numberOfLines={2}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {visibleText}
                </Typography>
            </Animated.View>
            {subtitle ? (
                <Animated.View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <TiltedArrow />
                    <Typography
                        type="callout"
                        style={{ paddingLeft: 6, color: '#9D9D9D', fontSize: 16 }}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {subtitle}
                    </Typography>
                </Animated.View>
            ) : (
                <Animated.View />
            )}
        </Animated.View>
    );
};

const BoostedImage = () => {
    return (
        <Animated.View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Image
                accessible={false}
                source={overlayImage}
                style={[
                    {
                        width: 87,
                        zIndex: 5,
                        height: 100,
                    },
                ]}
                resizeMode="cover"
            />
        </Animated.View>
    );
};

export default LookingForRides;
