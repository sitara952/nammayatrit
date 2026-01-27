import React from 'react';
import { tailwind } from '../../../tailwindTheme/tailwind';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { ImageProps, ViewStyle, StyleProp, ImageSourcePropType } from 'react-native';
import classNames from 'classnames';

type AvatarPropTypes = ImageProps & {
    uri: string | number | ImageSourcePropType;
    isLink: boolean | undefined;
    style: StyleProp<ViewStyle> | undefined;
    type: 'sm' | 'md' | 'lg' | undefined;
};

const Avatar = ({ uri, style, type = 'lg', isLink = false }: AvatarPropTypes) => {
    return (
        <Animated.View
            style={tailwind.style(
                classNames({
                    'p-[1.5px] border-[1.5px] border-[#1D74F6] rounded-[32px]': isLink,
                }),
            )}>
            <Animated.Image
                accessible={true}
                accessibilityLabel="avatar image"
                source={typeof uri === 'string' ? { uri } : uri}
                layout={LinearTransition}
                style={[
                    tailwind.style(
                        classNames(
                            {
                                'w-[80px] h-[56px] rounded-[30px]': type === 'lg',
                            },
                            {
                                'w-[56px] h-[44px] rounded-[22px]': type === 'md',
                            },
                            {
                                'w-[42px] h-[36px] rounded-[18px]': type === 'sm',
                            },
                        ),
                    ),
                    style,
                ]}
            />
        </Animated.View>
    );
};

export default Avatar;
