import React, { memo, useEffect, useState, useMemo } from 'react';
import Animated from 'react-native-reanimated';
import Typography from '../../designSystem/components/primitives/Typography';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import {
    selectCustomerTip,
    selectIsSearchBoosted,
    selectSelectedPricingItems,
    selectIsCustomTip,
    setIsCustomTip,
    selectPersistedTipOptions,
    setPersistedTipOptions,
    selectPricingItems,
    TripMode,
    selectPersistedSmartTipValue,
    setPersistedSmartTipValue,
} from '@/typescript/state/client/search';
import { selectSearchId } from '@/typescript/state/client/user';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { getAvailableTipOptions, getPersistedTipOptions } from '@/src-v2/utils/common';
import { View } from 'react-native';
import Tag from '@/typescript/designSystem/components/primitives/Tag';
import colors from '@/typescript/designSystem/colorPalette';
import token from '@/typescript/designSystem/tokens';
import { ArraySlider } from '@/typescript/components/ArraySlider';
import { selectNewFeatureFlags, useSliderOrPill } from '@/typescript/state/client/session';
import { EventName, logEvent, LogInterface } from '@/typescript/utils/logger';
import CustomTipModal from '@/typescript/designSystem/components/CustomTipModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Icon } from '@/typescript/components/Icon';
import Cross from '@/typescript/assets/svg/symbols/Cross';
import { colors as configColors } from 'config-types/src/domain/default/themes/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

interface BoostSearchTipProps {
    selectTip: number | undefined;
    setSelectedTip: React.Dispatch<React.SetStateAction<number | undefined>>;
    isEstimatesScreen: boolean;
    currentlySelectedIds?: string[];
}

const tipChangeCounter = {
    count: 0,
    increment() {
        this.count++;
    },
    reset() {
        this.count = 0;
    },
    get() {
        return this.count;
    },
};

export const getTipChangeCount = () => tipChangeCounter.get();
export const resetTipChangeCount = () => tipChangeCounter.reset();

const getTipEmoji = (index: number) => {
    const emojis = ['😊', '😄', '🤩', '💛', '🚀'];
    return emojis[index] || '';
};

const BoostSearchTipsModal = ({
    selectTip,
    setSelectedTip,
    isEstimatesScreen,
    currentlySelectedIds = [],
}: BoostSearchTipProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const isCustomTip = useAppSelector(state => selectIsCustomTip(state, null));
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const isSearchBoosted = useAppSelector(state => selectIsSearchBoosted(state, null));

    const customerTip = useAppSelector(state => selectCustomerTip(state, null));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const allPricingItems = useAppSelector(state => selectPricingItems(state, null));
    const persistedTipOptions = useAppSelector(state => selectPersistedTipOptions(state, null));
    const persistedSmartTipValue = useAppSelector(state => selectPersistedSmartTipValue(state, null));
    const shouldShowDefaultTips = useAppSelector(selectNewFeatureFlags).shouldShowDefaultTips;

    const smartTipValue = useMemo(() => {
        if (isEstimatesScreen) {
            return selectedPricingItems?.[0]?.smartTipSuggestion?.value;
        } else {
            if (persistedTipOptions && persistedTipOptions.length > 0) {
                return persistedSmartTipValue;
            }

            if (currentlySelectedIds.length === 0) return undefined;

            for (const selectedId of currentlySelectedIds) {
                const variant = allPricingItems.find(item => item.id === selectedId);

                if (variant && variant.tripMode === TripMode.DynamicOffer && variant.smartTipSuggestion?.value) {
                    return variant.smartTipSuggestion?.value;
                }
            }

            return undefined;
        }
    }, [
        isEstimatesScreen,
        selectedPricingItems,
        currentlySelectedIds,
        allPricingItems,
        persistedSmartTipValue,
        persistedTipOptions,
    ]);

    const tipOptions = isEstimatesScreen
        ? getAvailableTipOptions(shouldShowDefaultTips, selectedPricingItems)
        : getPersistedTipOptions(persistedTipOptions, currentlySelectedIds, allPricingItems, shouldShowDefaultTips);
    const [currentIndex, setCurrentIndex] = useState(0);
    const useTipSlider = useAppSelector(useSliderOrPill);

    const sliderOnEstimates = useTipSlider.sliderOnEstimates;
    const sliderOnSearch = useTipSlider.sliderOnSearch;
    const [showCustomModal, setShowCustomModal] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (customerTip) {
            const idx = tipOptions.indexOf(customerTip);
            if (idx != -1) {
                setCurrentIndex(idx);
            }
        }
    }, []);

    useEffect(() => {
        if (!isEstimatesScreen && tipOptions.length > 0 && (!persistedTipOptions || persistedTipOptions.length === 0)) {
            dispatch(setPersistedTipOptions({ id: searchId, payload: tipOptions }));
        }
    }, [tipOptions, persistedTipOptions, isEstimatesScreen, searchId, dispatch]);

    useEffect(() => {
        if (
            !isEstimatesScreen &&
            smartTipValue !== undefined &&
            persistedSmartTipValue === null &&
            (!persistedTipOptions || persistedTipOptions.length === 0)
        ) {
            dispatch(setPersistedSmartTipValue({ id: searchId, payload: smartTipValue }));
        }
    }, [smartTipValue, persistedSmartTipValue, isEstimatesScreen, searchId, dispatch, persistedTipOptions]);

    const transformLabel = (value: number) => {
        const currencySymbol = CURRENCY_SYMBOL.value;
        if (value == 0) {
            return `${currencySymbol}0`;
        }
        return `+${currencySymbol}${value}`;
    };

    const handleTipChange = (newTip: number | undefined) => {
        tipChangeCounter.increment();
        logEvent(EventName.TIP_CHANGE, {}, [LogInterface.Firebase]);

        setSelectedTip(newTip);
    };

    const filteredTipOptions = tipOptions
        .filter(item => item !== 0)
        .map((item, idx) => ({ value: item, emoji: getTipEmoji(idx), index: idx }));
    const isCustomSelected = isCustomTip && selectTip !== undefined;

    const handleCustomTip = (value: number) => {
        dispatch(setIsCustomTip({ id: searchId, payload: true }));
        handleTipChange(value);
    };

    const sliderWidth = isEstimatesScreen ? SCREEN_WIDTH - 46 : SCREEN_WIDTH - 72;
    const SliderTipView = () => {
        return (
            <View
                accessible={true}
                style={tailwind.style('px-4')}
                accessibilityLabel={`Tip slider, current value: ${CURRENCY_SYMBOL.value}${tipOptions[currentIndex]}`}
                accessibilityLiveRegion="polite">
                <ArraySlider
                    sliderWidth={sliderWidth}
                    onChange={(value: number) => {
                        setCurrentIndex(value);
                        const newTip = tipOptions[value] != 0 ? tipOptions[value] : undefined;
                        handleTipChange(newTip);
                    }}
                    values={tipOptions}
                    selectedIndex={currentIndex}
                    filledColor="#58545D"
                    unfilledColor="#E7E7E7"
                    pointSize={isEstimatesScreen ? 3 : 6}
                    transformLabel={transformLabel}
                    useGradient={isSearchBoosted}
                    gradient={['#FFD847', '#F78118']}
                />
            </View>
        );
    };

    // TipTag component for rendering a tip option or custom tag
    const TipTag = ({
        value,
        selected,
        onPress,
        isCustom,
        emoji,
        index,
    }: {
        value: number | 'Custom';
        selected: boolean;
        onPress: () => void;
        isCustom: boolean;
        emoji: string;
        index: number;
    }) => (
        <View
            style={tailwind.style('mt-4')}
            key={isCustom ? 'custom' : value}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Tip option: ${isCustom ? 'Custom' : value === 0 ? 'None' : `${CURRENCY_SYMBOL.value}${value}`}, ${selected ? 'selected' : 'not selected'}`}
            accessibilityLiveRegion="assertive">
            {value === smartTipValue ? (
                <View
                    style={tailwind.style(
                        `absolute left-4 z-40 w-18 px-2 py-2px text-white bg-[${themeColors.Icon_positive}] bottom-8 rounded-full items-center self-center`,
                    )}>
                    <View>
                        <Typography
                            style={tailwind.style('w-full font-bold text-white text-[9px] z-40')}
                            type="body-7"
                            accessibilityLabel=""
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Suggested}
                        </Typography>
                    </View>
                </View>
            ) : null}
            <Tag
                testID={`tip selected - ${isCustom ? 'custom' : value}`}
                size="md"
                type="secondary-dark"
                text={isCustom && selected && selectTip ? selectTip.toString() : isCustom ? 'Custom' : value.toString()}
                selected={selected}
                style={tailwind.style(
                    `border-[${colors?.recovered?.neutralLow}]`,
                    `${index === 0 ? 'ml-3' : ''}`,
                    `${index === filteredTipOptions.length ? 'mr-3' : ''}`,
                )}
                onPress={onPress}>
                <View style={tailwind.style('flex-row items-center justify-center')}>
                    {isCustom && selected && selectTip && selectTip > 0 ? (
                        <View style={tailwind.style('flex-row items-center gap-[4px]')}>
                            <Typography
                                type="subhead-1-rupee"
                                style={tailwind.style(
                                    selected ? 'text-[#fff] ' : `text-[${token?.text?.['text-bold']}]`,
                                )}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible
                                accessibilityLabel="₹"
                                accessibilityRole={undefined}>
                                ₹
                            </Typography>
                            <View style={tailwind.style('flex-row items-center gap-[3px]')}>
                                <Typography
                                    type="callout"
                                    style={tailwind.style(
                                        selected ? 'text-[#fff]' : `text-[${token?.text?.['text-bold']}]`,
                                    )}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible
                                    accessibilityLabel="Custom tip value"
                                    accessibilityRole={undefined}>
                                    {selectTip + ' ' + emoji + ' '}
                                </Typography>
                                <Icon
                                    icon={<Cross fill={selected ? '#fff' : `#9392A0`} />}
                                    size={9}
                                    color={selected ? '#fff' : `#9392A0`}
                                />
                            </View>
                        </View>
                    ) : !isCustom && value !== 0 ? (
                        <View style={tailwind.style('flex-row items-center gap-[4px]')}>
                            <Typography
                                style={tailwind.style(
                                    !selected
                                        ? `text-[${token?.text?.['text-bold']}]`
                                        : `text-[${token?.text?.['text-inverse-highContrast']}]`,
                                )}
                                type="subhead-1-rupee"
                                accessibilityLabel={CURRENCY_SYMBOL.value}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityRole={undefined}>
                                {CURRENCY_SYMBOL.value}
                            </Typography>
                            <Typography
                                type="callout"
                                style={tailwind.style(
                                    !selected
                                        ? `text-[${token?.text?.['text-bold']}]`
                                        : `text-[${token?.text?.['text-inverse-highContrast']}]`,
                                )}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {value.toString() + ' ' + emoji}
                            </Typography>
                        </View>
                    ) : (
                        <Typography
                            type="callout"
                            style={tailwind.style(selected ? 'text-[#fff]' : `text-[${token?.text?.['text-bold']}]`)}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible
                            accessibilityLabel={isCustom ? 'Custom' : value === 0 ? 'None' : value.toString()}
                            accessibilityRole={undefined}>
                            {isCustom
                                ? userLanguageStrings.Custom
                                : value === 0
                                  ? userLanguageStrings.None
                                  : value.toString()}
                        </Typography>
                    )}
                </View>
            </Tag>
        </View>
    );

    const ButtonTipView = () => {
        return (
            <ScrollView
                horizontal
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tailwind.style('flex-row gap-[8px]', ``)}>
                {filteredTipOptions.map(({ value, emoji, index }) => (
                    <TipTag
                        key={value}
                        value={value}
                        index={index}
                        selected={(selectTip ?? 0) === value && !isCustomTip}
                        onPress={() => {
                            if (selectTip === value) {
                                dispatch(setIsCustomTip({ id: searchId, payload: false }));
                                handleTipChange(undefined);
                            } else {
                                dispatch(setIsCustomTip({ id: searchId, payload: false }));
                                handleTipChange(value);
                            }
                        }}
                        isCustom={false}
                        emoji={emoji}
                    />
                ))}
                <TipTag
                    isCustom={true}
                    value="Custom"
                    selected={isCustomSelected}
                    onPress={() => {
                        if (isCustomSelected) {
                            dispatch(setIsCustomTip({ id: searchId, payload: false }));
                            handleTipChange(undefined);
                        } else {
                            setShowCustomModal(true);
                        }
                    }}
                    index={filteredTipOptions.length}
                    emoji={getTipEmoji(filteredTipOptions.length)}
                />
                <CustomTipModal
                    visible={showCustomModal}
                    onClose={() => setShowCustomModal(false)}
                    onSubmit={handleCustomTip}
                />
            </ScrollView>
        );
    };

    const marginTop = tipOptions.filter(item => item === smartTipValue).length > 0 ? 10 : -5;
    return (
        <>
            {tipOptions.length > 0 ? (
                <Animated.View>
                    {!isEstimatesScreen ? (
                        <Typography
                            type="callout-1"
                            style={{ color: configColors.gray750, fontSize: 14, marginHorizontal: 12 }}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {customerTip && customerTip != 0
                                ? `${CURRENCY_SYMBOL.value}${customerTip} tip added`
                                : userLanguageStrings.OfferAdditionalFare}
                        </Typography>
                    ) : null}
                    <View style={{ marginTop: marginTop }}>
                        {isEstimatesScreen
                            ? sliderOnEstimates
                                ? SliderTipView()
                                : ButtonTipView()
                            : sliderOnSearch
                              ? SliderTipView()
                              : ButtonTipView()}
                    </View>
                </Animated.View>
            ) : null}
        </>
    );
};

export default memo(BoostSearchTipsModal);
