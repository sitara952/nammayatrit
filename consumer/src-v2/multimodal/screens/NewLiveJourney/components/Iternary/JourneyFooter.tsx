import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import React, { useCallback } from 'react';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import { Icon } from '../../../../components/common/Icon';
import { getIcon } from '../../utils/getIternaryUtils';
import { JourneyStatus, Transit } from './types';
import Shimmer from '../../../Search/components/SearchSectionListItem/Shimmer';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TransitType } from './types';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { checkTaxiLeg } from '@/typescript/utils/common';

interface JourneyFooterProps {
    currentStatus: JourneyStatus;
    entireJourney: Transit[];
    onPressDetails: () => void;
    isLoading: boolean;
    firstTransit: TransitType | undefined;
    isJourneyLive: boolean;
    onPressStatusBadge: () => void;
}

export const JourneyFooter: React.FC<JourneyFooterProps> = ({
    currentStatus,
    entireJourney,
    onPressDetails,
    isLoading,
    firstTransit,
    isJourneyLive,
    onPressStatusBadge,
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const onPress = useCallback(() => {
        if (isJourneyLive) onPressDetails();
        else onPressStatusBadge();
    }, [isJourneyLive, onPressDetails, onPressStatusBadge]);

    return (
        <>
            <Animated.View style={animatedStyle}>
                <Pressable
                    {...handlers}
                    disabled={isLoading}
                    onPress={onPress}
                    accessibilityRole="button"
                    accessibilityLabel="View details button"
                    testID="view-details"
                    style={[
                        tailwind.style(
                            `bg-[${colors.Button_for_modes_bg}] rounded-[16px] py-[19px] gap-[7px] items-center mb-2 flex-row justify-center`,
                            isLoading && { opacity: 0.5 },
                        ),
                        {
                            shadowOffset: {
                                width: 0,
                                height: 3.7,
                            },
                            shadowOpacity: 0.16,
                            shadowRadius: 3.8,
                            shadowColor: '#000',
                        },
                    ]}>
                    <Text
                        style={tailwind.style(
                            `text-[${colors.Button_for_modes_text}] text-[15px] font-areaNormal-extrabold leading-[18px]`,
                        )}
                        accessibilityRole="button"
                        accessibilityLabel={
                            currentStatus === 'LIVE'
                                ? firstTransit &&
                                  checkTaxiLeg(firstTransit.type) &&
                                  firstTransit.state === 'VEHICLEBOOKINGPENDING'
                                    ? userLanguageStrings.BookRide
                                    : userLanguageStrings.ViewDetails
                                : userLanguageStrings.ViewTicket
                        }
                        accessibilityHint="View journey details">
                        {currentStatus === 'LIVE'
                            ? firstTransit &&
                              checkTaxiLeg(firstTransit.type) &&
                              firstTransit.state === 'VEHICLEBOOKINGPENDING'
                                ? firstTransit?.type === 'TAXI'
                                    ? userLanguageStrings.BookCab
                                    : firstTransit.type === 'BIKE'
                                      ? userLanguageStrings.BookBike
                                      : userLanguageStrings.BookAuto
                                : userLanguageStrings.ViewDetails
                            : userLanguageStrings.FixLocation}
                    </Text>
                    <Icon
                        icon={<DoubleArrowsWhite fill={colors.Button_for_modes_text} />}
                        color={colors.Button_for_modes_text}
                    />
                </Pressable>
            </Animated.View>

            <Animated.View style={tailwind.style('flex-row justify-center items-center mt-3')}>
                {!isLoading ? (
                    <Animated.View style={tailwind.style('flex-row items-center')}>
                        {entireJourney.map((transit, i) => (
                            <React.Fragment key={i}>
                                {getIcon(transit, 16, '#969696', undefined, undefined)}
                                {i < entireJourney.length - 1 && getIcon('>', 16, '#969696', undefined, undefined)}
                            </React.Fragment>
                        ))}
                    </Animated.View>
                ) : (
                    <Shimmer width={'50%'} height={16} borderRadius={7} />
                )}
            </Animated.View>
        </>
    );
};
