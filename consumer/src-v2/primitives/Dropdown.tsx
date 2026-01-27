import React, { useEffect, useRef } from 'react';
import { useState, PropsWithChildren } from 'react';
import { View, StyleSheet, Text, ViewStyle, TextStyle, Keyboard } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ChevronDownIcon from '@/typescript/components/common/ChevronDownIcon';
import sharedStyles from '@/typescript/constants/style';
import { ScrollView } from 'react-native-gesture-handler';

import { tailwind } from '../../src/typescript/tailwindTheme/tailwind';
import { setFocus } from '../../src/typescript/utils/Accessibility';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

type ItemObject = {
    text: string;
    icon: React.JSX.Element | undefined;
};

type DropdownProps = PropsWithChildren<{
    label: string | undefined;
    placeHolder: string | undefined;
    errorText: string | undefined;
    maxTextLen: number | undefined;
    style: ViewStyle | undefined;
    dropDownItems: ItemObject[];
    onSelect: ((item: string) => void) | undefined;
    showSelectedItem: boolean | undefined;
    touchableContainerStyle: ViewStyle | undefined;
    dropdownContainerStyle: ViewStyle | undefined;
    itemTextStyle: ViewStyle | undefined;
    onPress: (() => void) | undefined;
    preSelectedValue: ItemObject | undefined;
    labelTextStyle: TextStyle | undefined;
}>;

const Dropdown: React.FC<DropdownProps> = ({
    placeHolder,
    errorText = '',
    label,
    style,
    dropDownItems,
    onSelect,
    showSelectedItem = true,
    touchableContainerStyle,
    dropdownContainerStyle,
    itemTextStyle,
    onPress,
    preSelectedValue,
    labelTextStyle,
}) => {
    const [isFocused, setFocused] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | undefined>(preSelectedValue?.text || placeHolder);
    const isDropdownExpanded = useSharedValue(0);
    const height = useSharedValue(0);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const genders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];

    // Add useEffect to update selectedItem when preSelectedValue changes
    useEffect(() => {
        if (preSelectedValue?.text !== selectedItem) {
            handleItemPress(preSelectedValue?.text);
        }
    }, [preSelectedValue?.text]);

    // Function to toggle dropdown focus
    const handleTextFocus = (focus: boolean) => {
        isDropdownExpanded.value = withTiming(focus ? 1 : 0);
        height.value = withTiming(200);
        setFocused(focus);
    };

    // Function to handle item selection
    const handleItemPress = (item: string | undefined) => {
        setSelectedItem(item);
        handleTextFocus(false);
    };

    // Animated style for dropdown arrow
    const downArrowRotateAnimation = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: `${interpolate(isDropdownExpanded.value, [0, 1], [0, 180])}deg`,
            },
        ],
    }));

    const heightInterpolate = useAnimatedStyle(() => ({
        height: interpolate(isDropdownExpanded.value, [0, 1], [0, 200]),
    }));

    const listRef = useRef<Animated.View | null>(null);
    const onPlaceHolderPress = () => {
        Keyboard.dismiss();
        if (onPress != undefined) {
            onPress();
        }
        handleTextFocus(!isFocused);
        setFocus(listRef);
    };

    useEffect(() => {
        if (isFocused) {
            setFocus(listRef);
        }
    }, [isFocused]);

    return (
        <View style={[styles.wrapper, style]} accessibilityViewIsModal={isFocused}>
            <View style={!showSelectedItem && { flex: 1 }}>
                <View style={!showSelectedItem && { alignSelf: 'flex-end' }}>
                    {/* Label */}
                    {label && (
                        <Typography
                            type="body-7"
                            style={[{ marginBottom: 2, marginTop: 10 }, labelTextStyle]}
                            accessible={false}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {label}
                        </Typography>
                    )}

                    {/* Display selected item or placeholder */}
                    <TouchableOpacity
                        testID="71482ca3-6825-4c82-8cab-88bd9bb557ef"
                        accessibilityRole="radiogroup"
                        accessibilityLabel={label || placeHolder}
                        style={[
                            styles.touchableContainer,
                            isFocused && { borderColor: themeColors.Border_primraryHigh },
                            touchableContainerStyle,
                        ]}
                        onPress={onPlaceHolderPress}>
                        <Text style={styles.inputText}>{selectedItem}</Text>
                        <Animated.View style={downArrowRotateAnimation}>
                            <ChevronDownIcon
                                color={undefined}
                                size={undefined}
                                paddingLeft={undefined}
                                paddingRight={undefined}
                                paddingBottom={undefined}
                                paddingTop={undefined}
                            />
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Dropdown list */}
                </View>
            </View>
            {
                <Animated.View
                    ref={listRef}
                    accessibilityRole={'list'}
                    style={[
                        isFocused && styles.dropdownContainer,
                        dropdownContainerStyle,
                        tailwind.style(`border-[${themeColors.Border_primraryHigh}]`),
                        heightInterpolate,
                    ]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: 200 }}
                        contentContainerStyle={{ paddingVertical: 8 }}
                        keyboardShouldPersistTaps="handled">
                        {dropDownItems.map((item, index) => (
                            <TouchableOpacity
                                testID={`631e1348-6a2a-4727-8d5f-5daeb242ca86-${index}`}
                                key={index}
                                activeOpacity={0.4}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    handleItemPress(item.text);
                                    onSelect?.(genders[index] ?? '');
                                }}
                                accessibilityLabel={item.text}
                                accessibilityRole="menuitem">
                                {item.icon ?? null}
                                <Text style={[styles.itemText, itemTextStyle]}>{item.text}</Text>
                            </TouchableOpacity>
                        ))}

                        {dropDownItems.length === 0 && (
                            <Text style={styles.noResults}>{userLanguageStrings.Noresultsfound}</Text>
                        )}
                    </ScrollView>
                </Animated.View>
            }

            {/* Error text */}
            {errorText && <Text style={styles.errorText}>{errorText}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        zIndex: 10,
    },
    labelStyle: {
        paddingTop: 8,
    },
    touchableContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: sharedStyles.borderNeutralMid.color,
    },
    dropdownContainer: {
        position: 'relative',
        marginTop: 5,
        borderWidth: 1,
        borderRadius: 10,
        zIndex: 10000,
        backgroundColor: '#fff',
    },
    separator: {
        height: 1,
        backgroundColor: sharedStyles.borderNeutralLow.color,
        marginHorizontal: 8,
    },
    dropdownItem: {
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    inputText: {
        flexGrow: 1,
        fontSize: 16,
        color: '#14171f',
    },
    noResults: {
        textAlign: 'center',
        paddingVertical: 20,
    },
    errorText: {
        color: sharedStyles.errorColor.color,
        paddingTop: 2,
        paddingLeft: 2,
    },
    itemText: {
        fontSize: 16,
        color: '#14171f',
        width: '100%',
    },
});

export default Dropdown;
