import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { HeroTitleProps } from '../rules/schema';

const HeroTitle: React.FC<HeroTitleProps> = ({ title }) => {
    return (
        <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 0 }}>
            <Typography
                type="subhead-800"
                style={{ fontSize: 18, fontWeight: '600', color: '#000000' }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {title}
            </Typography>
        </View>
    );
};

export default React.memo(HeroTitle);
