import classNames from 'classnames';
import React from 'react';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import Chat from './primitives/Chat';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import token from '../tokens';
import Typography from './primitives/Typography';

import { useConfigContext } from '@/typescript/context/ConfigContext';

type ConversationTypes = {
    avatarUri: string;
    type: 'send' | 'receive';
    text: string;
    isAvatar: boolean;
    time: string;
    isVariant: boolean | undefined;
    showTime: boolean | undefined;
    isDriver: boolean;
    nameInitial: string;
};

const Conversation = ({
    // avatarUri,
    type,
    text,
    isAvatar,
    time,
    isVariant = false,
    showTime = true,
}: // isDriver,
// nameInitial,
ConversationTypes) => {
    const configManager = useConfigContext();
    // const userName = useAppSelector(selectUserName);
    const themeColors = configManager.get('themeColors');
    return (
        <Animated.View
            layout={LinearTransition}
            style={tailwind.style(
                `flex-row gap-[${token?.spacing?.[8]}] items-center
        pb-2
          px-[28px] max-w-min `,
                classNames(
                    { 'justify-end': type === 'send' },
                    {
                        'justify-start': type === 'receive',
                    },
                ),
            )}
            accessible
            accessibilityLabel={`${type === 'receive' ? 'Message From Driver: ' : 'Message sent by you: '} ${text}`}>
            {type === 'receive' ? (
                <>
                    <Animated.View
                        layout={LinearTransition}
                        style={tailwind?.style('flex-col items-start justify-start mr-[100px]')}>
                        <Chat type={type} text={text} isVariant={isVariant} />
                        {isAvatar && showTime ? (
                            <Animated.View
                                layout={LinearTransition}
                                entering={FadeIn.springify().damping(28).stiffness(20)}>
                                <Typography
                                    type="micro"
                                    style={tailwind.style(
                                        `pt-[${token?.spacing?.[12]}] text-[${themeColors.Text_neutralHigh}]`,
                                    )}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {time}
                                </Typography>
                            </Animated.View>
                        ) : null}
                    </Animated.View>
                </>
            ) : (
                <>
                    <Animated.View
                        layout={LinearTransition}
                        style={[tailwind?.style('flex-col items-end justify-end ml-[100px]')]}>
                        <Chat type={type} text={text} isVariant={isVariant} />
                        {isAvatar && showTime ? (
                            <Animated.View
                                layout={LinearTransition}
                                entering={FadeIn.springify().damping(28).stiffness(20)}>
                                <Typography
                                    type="micro"
                                    style={tailwind.style(
                                        `pt-[${token?.spacing?.[12]}] text-[${themeColors.Text_neutralHigh}] text-end	`,
                                    )}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {time}
                                </Typography>
                            </Animated.View>
                        ) : null}
                    </Animated.View>
                </>
            )}
        </Animated.View>
    );
};

export default Conversation;
