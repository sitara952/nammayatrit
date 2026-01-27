import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

interface LoadingOverlayProps {
    visible: boolean;
    message: string;
    backgroundColor?: string;
    spinnerColor?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    message,
    backgroundColor = 'rgba(0, 0, 0, 0.5)',
    spinnerColor = '#007AFF',
}) => {
    if (!visible) return null;

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
            }}>
            <View
                style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 12,
                    alignItems: 'center',
                    minWidth: 200,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}>
                <ActivityIndicator size="large" color={spinnerColor} />
                <Typography
                    type="body-1"
                    style={{ marginTop: 16, textAlign: 'center', color: '#333' }}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {message}
                </Typography>
            </View>
        </View>
    );
};

export default LoadingOverlay;
