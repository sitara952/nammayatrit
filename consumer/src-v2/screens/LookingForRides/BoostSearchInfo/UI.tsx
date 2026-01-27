import { CurrencyText } from '@/typescript/components/CurrencyText';
import { Icon } from '@/typescript/components/Icon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

import { TipGiftIconWithoutBG } from '@/typescript/assets/svg/symbols/TipGiftIconWithoutBG';
import { EditPencil } from '@/typescript/assets/svg/symbols/EditPencil';
import VehicleChangeIcon from '@/typescript/assets/svg/symbols/VehicleChangeIcon';
import { BoostSearchInfoUIProps } from './types';
import CircularProgress from '@/src-v2/components/CircularProgress';
import { useButtonProgressAnimation } from '@/src-v2/hooks/useButtonProgressAnimation';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { createAction } from '@/typescript/utils/common';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const BoostSearchInfoUI: React.FC<BoostSearchInfoUIProps> = ({
    containerStyle,
    customerTip,
    selectedItemName,
    rcsDispatch,
    isEditButtonDisabled,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const handleEditClick = () => {
        rcsDispatch(createAction('ON_EDIT_CLICKED', undefined));
    };

    const { buttonDisabled, secondsRemaining, progressValue, handleButtonPress, handleAnimationComplete } =
        useButtonProgressAnimation(isEditButtonDisabled, handleEditClick);

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <Animated.View
                layout={LinearTransition}
                style={tailwind.style(
                    `flex-2 py-[${token?.spacing?.[16]}] px-[${token?.spacing?.[16]}] flex-col justify-between gap-[${token?.gap.spacing[10]}] rounded-[${token?.corner?.md}] bg-[${themeColors.Fill_neutralMin}]`,
                )}>
                <Animated.View
                    layout={LinearTransition}
                    style={tailwind.style(`flex-row items-center justify-between w-full py-[${token?.spacing?.[6]}`)}>
                    <View style={tailwind.style('flex-row items-center')}>
                        <Icon icon={<TipGiftIconWithoutBG />} color="#14171F" size={16} />
                        <CurrencyText
                            textType="subhead"
                            textStyle={tailwind.style(`pl-[${token?.gap?.spacing?.[10]}]`)}
                            currencyStyle={tailwind.style(`font-inter-bold`)}
                            text={
                                customerTip === null || customerTip === undefined
                                    ? userLanguageStrings.Notipadded
                                    : userLanguageStrings.TipAdded(customerTip, CURRENCY_SYMBOL.value)
                            }
                        />
                    </View>
                </Animated.View>

                <Divider
                    type={undefined}
                    direction={undefined}
                    style={undefined}
                    labelPosition={undefined}
                    offset={undefined}
                    offsetBackground={undefined}
                    dividerColor={undefined}
                    strokeDashArray={undefined}
                />

                <Animated.View style={tailwind.style('flex-row items-center justify-between w-full')}>
                    <View style={tailwind.style(`flex-row items-center py-[${token?.spacing?.[6]}]`)}>
                        <Icon icon={<VehicleChangeIcon />} size={20} color={themeColors.Fill_neutralUltraLow} />
                        <Typography
                            type="subhead"
                            numberOfLines={1}
                            style={tailwind.style(`pl-[${token?.gap?.spacing?.[10]}] w-3/4 truncate overflow-hidden`)}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {selectedItemName}
                        </Typography>
                    </View>
                </Animated.View>
            </Animated.View>

            {buttonDisabled ? (
                <View
                    style={styles.editButtonContainer}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: true }}
                    accessibilityLabel={`Edit button disabled. Available in ${Math.ceil(secondsRemaining)} seconds`}
                    accessibilityHint="Please wait for the timer to complete before editing">
                    <CircularProgress
                        size={45}
                        strokeWidth={3}
                        progress={progressValue}
                        color={colors.recovered.handle}
                        backgroundColor={defaultColors.gray64}
                        style={undefined}
                        duration={10}
                        isReverse={true}
                        onAnimationComplete={handleAnimationComplete}>
                        <EditPencil style={{ opacity: 0.5 }} />
                    </CircularProgress>
                </View>
            ) : (
                <Pressable
                    testID="looking_for_rides_boost_edit"
                    onPress={handleButtonPress}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Edit vehicle and tip options button"
                    accessibilityHint="Tap to edit your vehicle selection and tip amount"
                    style={styles.editButton}>
                    <EditPencil />
                </Pressable>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    editButtonContainer: {
        height: 45,
        width: 45,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        height: 45,
        width: 45,
        borderRadius: 32,
        borderWidth: 1,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#4442480F',
    },
});
