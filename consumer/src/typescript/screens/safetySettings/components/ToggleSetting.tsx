import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { RNSwitch } from '../../../designSystem/components/primitives/RNSwitch';
import { ToggleSettingProps } from '../rules/schema';

const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, value, onChange }) => {
    return (
        <View
            style={{
                marginHorizontal: 16,
                marginVertical: 8,
                padding: 12,
                borderRadius: 10,
                backgroundColor: '#fff',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
            <Typography
                type="body-1"
                style={{ fontSize: 14, fontWeight: '600' }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {label}
            </Typography>
            <RNSwitch
                testID={`toggle-setting-${label}`}
                value={value}
                onChange={() => onChange(!value)}
                circleSize={24}
                containerWidth={44}
                translateValue={16}
                activeTrackColor="#4CAF50">
                {null}
            </RNSwitch>
        </View>
    );
};

export default React.memo(ToggleSetting);
