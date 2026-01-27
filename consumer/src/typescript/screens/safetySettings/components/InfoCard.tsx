import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { InfoCardProps } from '../rules/schema';

const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, icon: _icon }) => {
    return (
        <View style={{ marginHorizontal: 16, marginVertical: 8 }}>
            <Typography
                type="sub-body-700"
                style={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {title}
            </Typography>
            {subtitle ? (
                <Typography
                    type="body-1"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {subtitle}
                </Typography>
            ) : null}
        </View>
    );
};

export default React.memo(InfoCard);
