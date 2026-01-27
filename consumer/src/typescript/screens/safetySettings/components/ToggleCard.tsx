import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { RNSwitch } from '../../../designSystem/components/primitives/RNSwitch';
import { ToggleCardProps } from '../rules/schema';
import { Icon } from '@/typescript/components/Icon';

const ToggleCard: React.FC<ToggleCardProps> = ({
    label,
    value,
    onChange,
    description,
    marginVertical = 0,
    showNotificationBox = false,
    notificationText,
    icon,
}) => {
    return (
        <View style={{ marginHorizontal: 16, marginVertical }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                        type="body-1"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {label}
                    </Typography>
                    <RNSwitch
                        testID={`toggle-card-${label}`}
                        value={value}
                        onChange={() => onChange(!value)}
                        circleSize={24}
                        containerWidth={44}
                        translateValue={16}
                        activeTrackColor="#4CAF50">
                        {null}
                    </RNSwitch>
                </View>
                <View style={{ marginTop: 8 }}>
                    <Typography
                        type="body-subtext"
                        style={{ fontSize: 14 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {description}
                    </Typography>
                </View>

                {/* Orange notification box - only shown when showNotificationBox is true */}
                {showNotificationBox && (
                    <View
                        style={{
                            marginTop: 12,
                            backgroundColor: '#FFF3E0',
                            borderRadius: 12,
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                            }}>
                            {icon && <Icon icon={React.createElement(icon)} size={24} color="#000000" />}
                            <Typography
                                type="body-subtext"
                                style={{ fontSize: 13, flex: 1 }}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {notificationText}
                            </Typography>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default React.memo(ToggleCard);
