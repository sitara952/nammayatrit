import nyIcGreenTickWhiteCircularBg from '@/resources/assets/png/ny_ic_green_tick_white_circular_bg.webp';
import { StyleSheet, View, Image } from 'react-native';
import React from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

import Button from '../../primitives/Button.tsx';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { APIStatusComponentProps, APIStatus } from './types.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';

export const APIStatusComponent: React.FC<APIStatusComponentProps> = props => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const configuredStyles = styles(props.status);

    // Use the custom hook for debounced back press handling
    useDebounceBackPress(() => {
        props.onPress();
        return true;
    }, 1000);

    return (
        <Animated.View
            exiting={FadeOutUp.duration(150)}
            entering={FadeInDown.springify().damping(28).stiffness(200)}
            style={[tailwind.style('h-full w-full flex justify-content items-center', configuredStyles.body)]}>
            <View style={tailwind.style('items-center mx-auto my-auto')}>
                <View style={tailwind.style('flex justify-center items-center rounded')}>
                    <Image
                        accessible={false}
                        source={nyIcGreenTickWhiteCircularBg}
                        style={tailwind.style('mx-auto w-10 h-10 my-4')}
                    />
                </View>
                {props.headerText ? (
                    <Typography
                        type="body-2"
                        style={[tailwind.style('font-bold	'), configuredStyles.text]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {props.headerText}
                    </Typography>
                ) : null}
                {props.subHeaderText ? (
                    <Typography
                        type="body-1"
                        style={[tailwind.style('mt-2'), configuredStyles.text]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {props.subHeaderText}
                    </Typography>
                ) : null}
            </View>
            <View style={tailwind.style('w-full px-4 mb-6')}>
                <Button
                    testID="api_status_done_click"
                    type="secondary"
                    style={tailwind.style('justify-center items-center text-center')}
                    text={userLanguageStrings.Done}
                    onPress={props.onPress}
                />
            </View>
        </Animated.View>
    );
};

const styles = (status: APIStatus) => {
    switch (status) {
        case APIStatus.SUCCESS:
            return StyleSheet.create({
                body: tailwind.style('bg-green-500'),
                text: tailwind.style('text-white'),
            });
        case APIStatus.FAILED:
            return StyleSheet.create({
                body: tailwind.style('bg-orange-500'),
                text: tailwind.style('text-white'),
            });
        default:
            return StyleSheet.create({
                body: tailwind.style('bg-orange-500'),
                text: tailwind.style('text-white'),
            });
    }
};
