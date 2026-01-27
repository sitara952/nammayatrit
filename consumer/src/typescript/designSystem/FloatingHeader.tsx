import { StyleType } from '../types/CommonTypes';
import Animated, { FadeIn } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { View, StyleSheet, Platform } from 'react-native';
import token from './tokens';
import React from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';

type FloatingHeaderProps = {
    animatedStyle: StyleType;
    suffixButtons: React.ReactNode[];
    prefixButton: React.ReactNode | undefined;
    /* eslint-disable myCustomPlugin/enforce-optional-params */
    hideAccessibility?: boolean;
    buttonZindex?: number;
};
export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
    suffixButtons,
    prefixButton,
    hideAccessibility = false,
    buttonZindex = 99,
}) => {
    const { top } = useSafeAreaInsets();
    const filteredButtons = suffixButtons.filter(button => button !== null && button !== undefined);
    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            accessibilityElementsHidden={hideAccessibility}
            importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}
            style={[
                tailwind.style(
                    `absolute top-[${
                        Platform.OS === 'android' ? top : top - 10
                    }px] w-full flex-row justify-between items-start pl-[${token?.spacing[16]}]`,
                ),
                { zIndex: buttonZindex },
            ]}>
            <Animated.View style={tailwind.style('flex-row justify-start items-center gap-4')}>
                {prefixButton && <View>{prefixButton}</View>}
            </Animated.View>
            <Animated.View style={tailwind.style('flex-row justify-end items-center gap-4')}>
                <Animated.View>
                    <FlatList
                        scrollEnabled={
                            prefixButton === undefined ? filteredButtons.length > 3 : filteredButtons.length > 2
                        }
                        data={filteredButtons}
                        keyExtractor={(_, index) => `suffixButton-${index}`}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[
                            tailwind.style(
                                `flex-row justify-between items-center gap-4 pb-3 px-[${token?.spacing[16]}] `,
                            ),
                        ]}
                        renderItem={({ item }) => <View style={styles.buttonShadow}>{item}</View>}
                    />
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonShadow: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
    },
});
