import { StackNavigationOptions } from '@react-navigation/stack';

export const slideFromRightOptions: StackNavigationOptions = {
    cardStyleInterpolator: ({ current, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0], // Slide in from the right
                        }),
                    },
                ],
            },
        };
    },
};

export const slideFromLeftOptions: StackNavigationOptions = {
    cardStyleInterpolator: ({ current, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-layouts.screen.width, 0], // Slide in from the left
                        }),
                    },
                ],
            },
        };
    },
};

export const slideFromBottomOptions: StackNavigationOptions = {
    cardStyleInterpolator: ({ current, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0], // Slide in from the bottom
                        }),
                    },
                ],
            },
        };
    },
};

export const fadeOptions: StackNavigationOptions = {
    cardStyleInterpolator: ({ current }) => {
        return {
            cardStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1], // Fade in
                }),
            },
        };
    },
};
