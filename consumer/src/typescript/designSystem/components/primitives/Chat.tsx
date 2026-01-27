import React from 'react';
import { TextInputProps, StyleSheet } from 'react-native';
import token from '../../tokens/index';

import { tailwind } from '../../../tailwindTheme/tailwind';
import Typography from '../primitives/Typography';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

type ChatTypes = TextInputProps & {
    type: 'receive' | 'send';
    text: string;
    isVariant: boolean;
};

const Chat = React.forwardRef(({ text, type }: ChatTypes, ref: React.Ref<Animated.View>) => {
    return (
        <Animated.View
            ref={ref}
            style={tailwind?.style(`chat-${type}`, 'my-[2px]')}
            layout={LinearTransition}
            entering={FadeIn.springify().damping(28).stiffness(20)}>
            <Typography
                type="body-1"
                style={[tailwind.style(`text-[${token?.text?.['text-bold']}]`), styles.chatText]}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {text}
            </Typography>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    chatText: {
        fontSize: 14,
        lineHeight: 19,
        fontFamily: 'AreaNormal-Bold',
        fontWeight: 600,
    },
});

export default React.memo(Chat);
