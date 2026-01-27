import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { Icon } from '../../../components/Icon';
import { InfoActionCardProps } from '../rules/schema';

const InfoActionCard: React.FC<InfoActionCardProps> = ({ title, description, icon }) => {
    return (
        <View style={{ marginHorizontal: 16, marginVertical: 10 }}>
            <View
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}>
                {/* Top row with icon and title */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    {icon && (
                        <View style={{ marginRight: 12 }}>
                            <Icon icon={React.createElement(icon)} size={20} color="#333333" />
                        </View>
                    )}
                    <Typography
                        type="sub-body-700"
                        style={{ fontSize: 16, fontWeight: '600', color: '#000000', flex: 1, lineHeight: 20 }}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                </View>
                {/* Description text below */}
                <Typography
                    type="body-1"
                    style={{ fontSize: 14, color: '#666666', fontWeight: '500', lineHeight: 20 }}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {description}
                </Typography>
            </View>
        </View>
    );
};

export default React.memo(InfoActionCard);
