import React, { ReactNode, useState } from 'react';
import { View, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import ChevronUp from '@/typescript/assets/svg/symbols/ChevronUp';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface CollapsibleCardProps {
    title: string;
    children: ReactNode;
    initiallyExpanded?: boolean;
    rightElement?: ReactNode;
    testID?: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
    title,
    children,
    initiallyExpanded = false,
    rightElement,
    testID,
}) => {
    const [expanded, setExpanded] = useState(initiallyExpanded);

    const handleToggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(prev => !prev);
    };

    return (
        <Animated.View style={[tailwind.style('bg-white rounded-[16px] my-2'), styles.cardShadow]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${title} button`}
                accessibilityState={{ expanded }}
                onPress={handleToggle}
                style={tailwind.style('flex-row items-center justify-between px-4 py-4')}
                testID={testID || `${title.replace(/\s/g, '').toLowerCase()}-toggle`}>
                <Animated.Text style={tailwind.style('text-[17px] font-areaNormal-extrabold text-[#2F2D32]')}>
                    {title}
                </Animated.Text>
                <View style={tailwind.style('flex-row items-center')}>
                    {rightElement}
                    {expanded ? <ChevronUp height={20} width={20} /> : <ChevronDown height={20} width={20} />}
                </View>
            </Pressable>
            {expanded && <View style={tailwind.style('px-4 pb-4')}>{children}</View>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.1,
        elevation: 2,
    },
});

export default CollapsibleCard;
