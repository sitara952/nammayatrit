import React from 'react';
import { View, Image } from 'react-native';
import { HeroImageProps } from '../rules/schema';

const HeroImage: React.FC<HeroImageProps> = ({ image }) => {
    return (
        <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 16 }}>
            <View style={{ backgroundColor: '#eef1f6', borderRadius: 16, overflow: 'hidden' }}>
                {image ? (
                    <Image
                        source={image}
                        style={{ width: '100%', height: 180, borderRadius: 16 }}
                        resizeMode="cover"
                        accessible={true}
                        accessibilityLabel="safety settings hero image"
                    />
                ) : null}
            </View>
        </View>
    );
};

export default React.memo(HeroImage);
