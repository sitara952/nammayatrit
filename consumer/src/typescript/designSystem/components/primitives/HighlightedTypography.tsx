import React, { PropsWithChildren } from 'react';
import { TextStyle } from 'react-native';
import { Highlight, HighlightedText } from '@/src-v2/components/HighlightedText';
import Animated, { FlipInXDown, FlipInXUp } from 'react-native-reanimated';
import { tailwind } from '../../../tailwindTheme/tailwind';
import { styleAdapter } from '../../../utils/styleAdapter';
import { TypographyTypes } from './Typography';

interface HighlightedTypographyProps {
    type: TypographyTypes | undefined;
    style: TextStyle | undefined;
    numberOfLines: number | undefined;
    isAnimate: boolean | undefined;
    accessible: boolean | undefined;
    accessibilityLabel: string | undefined;
    searchTerm: string;
}

export const HighlightedTypography = (props: PropsWithChildren<HighlightedTypographyProps>) => {
    const {
        children,
        numberOfLines,
        isAnimate,
        type,
        style = {},
        accessible,
        accessibilityLabel,
        searchTerm = '',
    } = props;

    const replaceSpecialCharactersFromSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlights = new Highlight({
        keywords: [replaceSpecialCharactersFromSearchTerm],
        style: { color: '#868994' },
    });
    return (
        <Animated.View
            entering={isAnimate ? FlipInXDown.springify().damping(20).stiffness(100) : undefined}
            exiting={isAnimate ? FlipInXUp.springify().damping(20).stiffness(100) : undefined}>
            <HighlightedText
                highlights={[highlights]}
                style={[tailwind.style(`text-black ${type}`), styleAdapter(style, undefined)]} // by default color same as IOS
                numberOfLines={numberOfLines}
                accessible={accessible}
                accessibilityLabel={accessibilityLabel}>
                {children}
            </HighlightedText>
        </Animated.View>
    );
};
