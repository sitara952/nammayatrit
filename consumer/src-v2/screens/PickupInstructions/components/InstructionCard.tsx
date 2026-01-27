import { View, Image, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import React from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

export const InstructionCard: React.FC<{ image: string; title: string }> = ({ image, title }) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    accessible={true}
                    accessibilityLabel="instruction image"
                    source={{ uri: image }}
                    onLoad={() => setImageLoaded(true)}
                    style={styles.image}
                />
                {imageLoaded ? null : <ActivityIndicator size="large" color="blue" style={styles.loader} />}
            </View>
            <Typography
                type="body-7"
                style={styles.text}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 18,
        shadowColor: Platform.OS === 'android' ? '#F5F5F5' : undefined,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 7,
    },
    imageContainer: {
        width: '100%',
        height: 250,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 250,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
    },
    text: {
        paddingLeft: 16,
        padding: 12,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    loader: {
        position: 'absolute',
        alignSelf: 'center',
    },
});
