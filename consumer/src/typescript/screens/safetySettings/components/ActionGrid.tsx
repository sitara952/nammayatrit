import React from 'react';
import { View } from 'react-native';
import Typography from '../../../designSystem/components/primitives/Typography';
import { ActionGridProps } from '../rules/schema';
import { Icon } from '@/typescript/components/Icon';

const ActionGrid: React.FC<ActionGridProps> = ({ items }) => {
    return (
        <View
            style={{
                marginHorizontal: 16,
                marginVertical: 8,
                backgroundColor: '#F1F2F7',
                padding: 16,
                borderRadius: 16,
            }}>
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 12,
                    justifyContent: 'space-around',
                }}>
                {items.map(item => (
                    <View
                        testID={`action-${item.id}`}
                        key={item.id}
                        style={{
                            width: '45%',
                            height: 75,
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            padding: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                        {item.icon && typeof item.icon === 'function' && (
                            <View style={{ marginBottom: 12 }}>
                                <Icon icon={React.createElement(item.icon)} size={25} color="#333333" />
                            </View>
                        )}
                        <Typography
                            type="body-1"
                            style={{
                                fontSize: 13,
                                fontWeight: '500',
                                textAlign: 'center',
                                color: '#333333',
                                lineHeight: 20,
                            }}
                            numberOfLines={2}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {item.label}
                        </Typography>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default React.memo(ActionGrid);
