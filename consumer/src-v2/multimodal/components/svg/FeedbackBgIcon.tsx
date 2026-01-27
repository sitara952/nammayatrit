import * as React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const FeedbackBgIcon = () => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    return (
        <Svg fill="none">
            <Path
                fill="url(#a)"
                fillRule="evenodd"
                d="M187.659 165.949c-119.107 0-231.103 46.466-315.366 130.745h.237c-61.235 61.246-102.462 137.121-120.424 219.717v1.587h-.342v.001H-417V128.164l165.433 57.923a621.063 621.063 0 0 1 6.649-6.743C-129.366 63.654 24.228 0 187.777 0c163.55 0 317.262 63.653 432.695 179.344 93.152 93.05 152.409 210.993 172.083 338.655H623.791c-17.778-83.212-59.139-159.667-120.766-221.305-84.264-84.279-196.26-130.745-315.366-130.745Z"
                clipRule="evenodd"
            />
            <Path
                fill="url(#b)"
                fillRule="evenodd"
                d="M187.659 165.949c-119.107 0-231.103 46.466-315.366 130.745h.237c-61.235 61.246-102.462 137.121-120.424 219.717v1.587h-.342v.001H-417V128.164l165.433 57.923a621.063 621.063 0 0 1 6.649-6.743C-129.366 63.654 24.228 0 187.777 0c163.55 0 317.262 63.653 432.695 179.344 93.152 93.05 152.409 210.993 172.083 338.655H623.791c-17.778-83.212-59.139-159.667-120.766-221.305-84.264-84.279-196.26-130.745-315.366-130.745Z"
                clipRule="evenodd"
            />
            <Defs>
                <LinearGradient
                    id="a"
                    x1={274.174}
                    x2={274.174}
                    y1={213.675}
                    y2={670.161}
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor={colors.FeedbackGradient1} />
                    <Stop offset={1} stopColor={colors.FeedbackGradient2} />
                </LinearGradient>
                <LinearGradient
                    id="b"
                    x1={-382.154}
                    x2={-51.791}
                    y1={517.999}
                    y2={-275.637}
                    gradientUnits="userSpaceOnUse">
                    <Stop offset={0.06} stopColor={colors.FeedbackGradient3} />
                    <Stop offset={0.295} stopColor={colors.FeedbackGradient4} />
                    <Stop offset={0.63} stopColor={colors.FeedbackGradient5} />
                    <Stop offset={0.83} stopColor={colors.FeedbackGradient6} />
                    <Stop offset={1} stopColor={colors.FeedbackGradient7} />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};
