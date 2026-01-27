import { LottieWithFallback } from './common/LottieWithFallback';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

interface PetPawsProps {
    isLottieEnabled: boolean;
}

const PetPaws: React.FC<PetPawsProps> = ({ isLottieEnabled }) => {
    if (isLottieEnabled) {
        return (
            <LottieWithFallback
                source={require('../../../src-v2/assets/lottie/pet.lottie')}
                autoPlay
                loop
                style={{ width: 90, height: 94, position: 'absolute', bottom: -45, left: -16 }}
                fallback={undefined}
            />
        );
    }

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={{ marginLeft: 16, position: 'absolute', bottom: -11, left: -6 }}>
            <Svg width="50" height="24" viewBox="0 0 50 24" fill="none">
                <Path
                    d="M4.62536 23.1686C6.42147 23.8887 7.5072 22.2755 9.19133 22.2148C10.8281 22.2213 12.0704 23.774 13.7856 23.0216C14.7364 22.6324 15.3761 21.7074 15.347 20.6766C15.2773 17.5961 12.3588 14.0387 9.06089 14.088C5.74371 14.1413 2.51077 18.0479 3.01919 21.2443C3.16282 22.1856 3.80948 22.8649 4.62536 23.1686Z"
                    fill="#3B3A3C"
                />
                <Circle
                    cx="3.11408"
                    cy="11.8109"
                    r="2.16076"
                    transform="rotate(1.72989 3.11408 11.8109)"
                    fill="#3B3A3C"
                />
                <Circle
                    cx="14.8914"
                    cy="12.1625"
                    r="2.16076"
                    transform="rotate(1.72989 14.8914 12.1625)"
                    fill="#3B3A3C"
                />
                <Circle
                    cx="9.1258"
                    cy="8.05313"
                    r="2.16076"
                    transform="rotate(1.72989 9.1258 8.05313)"
                    fill="#3B3A3C"
                />
                <Path
                    d="M37.3067 17.6425C39.1039 18.36 40.1873 16.7451 41.8713 16.6819C43.5081 16.6859 44.7527 18.2368 46.4668 17.4818C47.417 17.0912 48.0553 16.1653 48.0247 15.1345C47.9504 12.0541 45.0265 8.50105 41.7287 8.55533C38.4116 8.61353 35.1845 12.525 35.6977 15.7207C35.8427 16.6617 36.4904 17.34 37.3067 17.6425Z"
                    fill="#3B3A3C"
                />
                <Circle
                    cx="35.7658"
                    cy="6.29219"
                    r="2.16076"
                    transform="rotate(1.64426 35.7658 6.29219)"
                    fill="#3B3A3C"
                />
                <Circle
                    cx="47.5432"
                    cy="6.62812"
                    r="2.16076"
                    transform="rotate(1.64426 47.5432 6.62812)"
                    fill="#3B3A3C"
                />
                <Circle
                    cx="41.7737"
                    cy="2.53437"
                    r="2.16076"
                    transform="rotate(1.64426 41.7737 2.53437)"
                    fill="#3B3A3C"
                />
            </Svg>
        </Animated.View>
    );
};

export default PetPaws;
