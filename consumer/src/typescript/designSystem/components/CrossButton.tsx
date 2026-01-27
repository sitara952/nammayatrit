import { FC } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import BlackCross from '../../assets/svg/symbols/BlackCross';
import React from 'react';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';
import { Pressable } from '@/src-v2/primitives/Pressable';

interface CrossButtonProps extends ViewProps {
    onClick: () => void;
    style?: StyleProp<ViewStyle>;
    size?: number;
}

const CrossButton: FC<CrossButtonProps> = ({ onClick, style, size, accessibilityLabel }) => {
    return (
        <Pressable
            testID="98d2d9a4-4f6a-422e-8798-036539f686db"
            onPress={onClick}
            style={style}
            accessibilityLabel={accessibilityLabel ?? 'Close'}
            accessibilityRole="imagebutton">
            <BlackCross height={size} width={size} />
        </Pressable>
    );
};

export default CrossButton;
