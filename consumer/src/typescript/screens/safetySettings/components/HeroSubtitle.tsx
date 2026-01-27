import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { HeroSubtitleProps } from '../rules/schema';

const HeroSubtitle: React.FC<HeroSubtitleProps> = ({ subtitle }) => {
    return (
        <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
            <Typography
                type="body-1"
                style={{ fontSize: 15, fontWeight: '400', color: '#666666', lineHeight: 24 }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {subtitle}
            </Typography>
        </View>
    );
};

export default React.memo(HeroSubtitle);
