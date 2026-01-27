import React, { FC, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import PersonalTrip from '@/typescript/assets/svg/symbols/PersonalTrip';
import BusinessTrip from '@/typescript/assets/svg/symbols/BusinessTrip';
import type { TripTypeSelection } from '@/typescript/state/client/search';
import Button from '@/src-v2/primitives/Button';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Animated, { useAnimatedStyle, withSpring, interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { PetPaw } from '@/typescript/components/svg/PetPaw';

const PET_RIDE_TOGGLE_ON_COLOR = '#09941E';
const PET_RIDE_TOGGLE_OFF_COLOR = '#F0F1F4';
const PET_RIDE_THUMB_COLOR = '#FFFFFF';

const SPRING_CONFIG = {
    mass: 0.5,
    damping: 20,
    stiffness: 300,
    overshootClamping: true,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
};

// Custom Switch Component
const CustomSwitch: FC<{ value: boolean; onValueChange: () => void; testID: string | undefined }> = ({
    value,
    onValueChange,
    testID = '',
}) => {
    const switchTranslate = useDerivedValue(() => {
        if (value) {
            return withSpring(21, SPRING_CONFIG);
        } else {
            return withSpring(2, SPRING_CONFIG);
        }
    }, [value]);

    const circleStyleAnimated = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: switchTranslate.value }],
        };
    });

    const interpolateBackgroundColor = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                switchTranslate.value,
                [2, 21],
                [PET_RIDE_TOGGLE_OFF_COLOR, PET_RIDE_TOGGLE_ON_COLOR],
            ),
        };
    });

    const handlePress = () => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        onValueChange();
    };

    return (
        <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            accessibilityLabel={value ? 'Pet ride enabled' : 'Pet ride disabled'}
            testID={testID}
            onPress={handlePress}>
            <Animated.View
                style={[
                    {
                        width: 45,
                        height: 24,
                        borderRadius: 15,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        position: 'relative',
                    },
                    interpolateBackgroundColor,
                ]}>
                <Animated.View
                    style={[
                        {
                            width: 20,
                            height: 20,
                            borderRadius: 12,
                            backgroundColor: PET_RIDE_THUMB_COLOR,
                        },
                        circleStyleAnimated,
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
};

interface TripTypeSelectorModalProps {
    onClose: () => void;
    selectedTripType: TripTypeSelection;
    isPetRide: boolean;
    onUpdate: (tripType: TripTypeSelection, petRide: boolean) => void;
    searchId: string | null;
    showTripTypeSelector: boolean;
}

export const TripTypeSelectorModal: FC<TripTypeSelectorModalProps> = ({
    onClose,
    selectedTripType,
    isPetRide,
    onUpdate,
    showTripTypeSelector,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const [localTripType, setLocalTripType] = useState<TripTypeSelection>(selectedTripType);
    const [localPetRide, setLocalPetRide] = useState<boolean>(isPetRide);

    useEffect(() => {
        setLocalTripType(selectedTripType);
        setLocalPetRide(isPetRide);
    }, [selectedTripType, isPetRide]);

    const isPersonal = localTripType === 'PERSONAL';

    const handlePersonalPress = () => {
        if (!isPersonal) {
            setLocalTripType('PERSONAL');
        }
    };

    const handleBusinessPress = () => {
        if (isPersonal) {
            setLocalTripType('BUSINESS');
        }
    };

    const handlePetRideToggle = () => {
        const newValue = !localPetRide;
        setLocalPetRide(newValue);
    };

    const handleUpdate = () => {
        // Only update trip type if trip type selector is visible, otherwise keep it as PERSONAL
        const tripTypeToUpdate = showTripTypeSelector ? localTripType : 'PERSONAL';
        onUpdate(tripTypeToUpdate, localPetRide);
        onClose();
    };

    const { bottom } = useSafeAreaInsets();
    const styles = createStyles(bottom);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Title */}
                <Typography
                    type="body-7"
                    style={tailwind.style(`text-[${themeColors.Text_neutralMax}] mb-[24px] text-base`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.RideFilter}
                </Typography>

                {/* Trip Type Selector - Only show if user has business profile verified */}
                {showTripTypeSelector && (
                    <View style={styles.toggleContainer}>
                        {/* Personal Button */}
                        <TouchableOpacity
                            testID="personal-trip-selector-modal"
                            onPress={handlePersonalPress}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Personal Trip"
                            style={[
                                styles.toggleButton,
                                styles.toggleButtonLeft,
                                isPersonal ? styles.toggleButtonSelected : styles.toggleButtonUnselected,
                            ]}>
                            <View style={styles.iconContainer}>
                                <PersonalTrip
                                    color={isPersonal ? '#FFFFFF' : '#454C55'}
                                    backgroundColor={isPersonal ? '#454C55' : '#FFFFFF'}
                                />
                            </View>
                            <Typography
                                type="subhead"
                                style={[
                                    styles.toggleButtonText,
                                    isPersonal ? styles.toggleButtonTextSelected : styles.toggleButtonTextUnselected,
                                ]}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={false}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Personal}
                            </Typography>
                        </TouchableOpacity>

                        {/* Business Button */}
                        <TouchableOpacity
                            testID="business-trip-selector-modal"
                            onPress={handleBusinessPress}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Business Trip"
                            style={[
                                styles.toggleButton,
                                styles.toggleButtonRight,
                                !isPersonal ? styles.toggleButtonSelected : styles.toggleButtonUnselected,
                            ]}>
                            <View style={styles.iconContainer}>
                                <BusinessTrip
                                    color={!isPersonal ? '#FFFFFF' : '#454C55'}
                                    backgroundColor={!isPersonal ? '#454C55' : '#FFFFFF'}
                                />
                            </View>
                            <Typography
                                type="subhead"
                                style={[
                                    styles.toggleButtonText,
                                    !isPersonal ? styles.toggleButtonTextSelected : styles.toggleButtonTextUnselected,
                                ]}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={false}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Business}
                            </Typography>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Divider - Only show if trip type selector is visible */}
                {showTripTypeSelector && (
                    <View
                        style={[
                            tailwind.style(`h-[1px] mb-[24px]`),
                            {
                                borderStyle: 'dashed',
                                borderWidth: 1,
                                borderColor: themeColors.Border_neutralMidLow,
                                backgroundColor: 'transparent',
                            },
                        ]}
                    />
                )}

                {/* Pet Ride Toggle */}
                <View style={tailwind.style('flex-row items-center justify-between mb-[32px]')}>
                    <View style={tailwind.style('flex-row items-center flex-1')}>
                        <PetPaw fill={themeColors.Text_neutralUltraHigh} />
                        <Typography
                            type="subhead"
                            style={tailwind.style(`text-[16px] text-[${themeColors.Text_neutralUltraHigh}] ml-[8px]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={false}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.PetFriendly}
                        </Typography>
                    </View>
                    <CustomSwitch
                        value={localPetRide}
                        onValueChange={handlePetRideToggle}
                        testID="trip_type_selector_modal_pet_ride_switch"
                    />
                </View>

                {/* Update Button */}
                <Button
                    testID="trip_type_selector_modal_update_button"
                    type="primary"
                    text={userLanguageStrings.Update}
                    onPress={handleUpdate}
                    size="lg"
                />
            </View>
        </View>
    );
};

const createStyles = (bottom: number) =>
    StyleSheet.create({
        container: {
            backgroundColor: '#F8F8F8',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        content: {
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: bottom,
        },
        toggleContainer: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 24,
        },
        toggleButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            gap: 6,
            borderRadius: 28,
        },
        iconContainer: {
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
        },
        toggleButtonLeft: {
            // No special styling needed
        },
        toggleButtonRight: {
            // No special styling needed
        },
        toggleButtonSelected: {
            backgroundColor: '#454C55',
            borderColor: '#454C55',
        },
        toggleButtonUnselected: {
            backgroundColor: '#FFFFFF',
            borderColor: '#E0E0E0',
        },
        toggleButtonText: {
            fontSize: 14,
            flexShrink: 1,
        },
        toggleButtonTextSelected: {
            color: '#FFFFFF',
        },
        toggleButtonTextUnselected: {
            color: '#3B3A3C',
        },
    });
