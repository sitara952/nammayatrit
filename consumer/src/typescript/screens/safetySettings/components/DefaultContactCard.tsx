import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import NameInitials from '../../../designSystem/components/NameInitials';
import { getInitials } from '@/typescript/utils/common';
import { DefaultContactCardProps } from '../rules/schema';

const DefaultContactCard: React.FC<DefaultContactCardProps> = ({ name, description }) => {
    return (
        <View
            style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                marginHorizontal: 16,
                marginVertical: 8,
            }}>
            {/* Contact Info Row */}
            <View
                style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    gap: 10,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Avatar using the NameInitials component */}
                    <NameInitials
                        nameInitial={getInitials(name) ?? ''}
                        style={{ marginRight: 12, width: 45, height: 35, borderRadius: 15 }}
                        textStyle={undefined}
                    />

                    {/* Contact Details */}
                    <View style={{ flex: 1 }}>
                        <Typography
                            type="body-1"
                            style={{ fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 4 }}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {name ?? 'Select a default contact'}
                        </Typography>
                    </View>
                </View>
                <Typography
                    type="body-1"
                    style={{ fontSize: 14, color: '#666' }}
                    numberOfLines={2}
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

export default React.memo(DefaultContactCard);
