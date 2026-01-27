import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { ShareOptionSelectorProps } from '../rules/schema';

const ShareOptionSelector: React.FC<ShareOptionSelectorProps> = ({
    contactId: _contactId,
    value,
    onChange: _onChange,
}) => {
    return (
        <View style={{ marginHorizontal: 16, marginVertical: 8 }}>
            <Typography
                type="body-1"
                style={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                Share preference: {value}
            </Typography>
        </View>
    );
};

export default React.memo(ShareOptionSelector);
