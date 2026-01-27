import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { handleCopyToClipBoard } from '@/src-v2/utils/common';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import { strings } from 'config-types';
import { MoviePromotionalConfig } from '@/src-v2/systems/configs/types';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

interface PromotionalModalProps {
    onClose: () => void;
    onButtonPress: () => void;
    buttonText: string;
    title: string;
    userLanguageStrings: strings;
    config: MoviePromotionalConfig;
    offerCode: string | null;
    onTnCClick: () => void;
}

export const PromotionalModal: React.FC<PromotionalModalProps> = ({
    onButtonPress,
    buttonText,
    title,
    config,
    offerCode,
    onTnCClick,
}) => {
    const couponCode = offerCode || 'ABC12300MZ';
    const { bottom, top } = useSafeAreaInsets();

    const termsAndConditions = [
        'Offer valid for all Namma Yatri users who complete at least 1 ride of 2 km or more. Limited coupon codes available',
        'Only rides booked and completed on the Namma Yatri app are considered',
        'Offer applicable only on booking a minimum of 2 tickets for Kantara Chapter 1',
    ];

    return (
        <View style={[styles.container, { paddingBottom: bottom, paddingTop: top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Typography
                    type="title-800"
                    style={styles.title}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
            </View>

            <View style={styles.imageWithCouponCode}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: config.images.promotionBanner,
                        }}
                        style={styles.promoImage}
                        resizeMode="contain"
                        accessible={true}
                        accessibilityLabel="promotional modal image"
                    />
                </View>

                {/* Tap to Copy Section */}
                <View style={styles.couponContainer}>
                    <View style={styles.couponBox}>
                        <Typography
                            type="title-800"
                            style={styles.couponCode}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {couponCode}
                        </Typography>
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={() => handleCopyToClipBoard(couponCode)}
                            style={styles.copyButton}
                            testID={'promotional_banner_copy'}>
                            <Typography
                                type="subhead-600"
                                style={styles.copyText}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                Tap to Copy
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Terms and Conditions Section */}
            <View style={styles.termsSection}>
                {termsAndConditions.map((term, index) => (
                    <View key={index} style={styles.termItem}>
                        <Typography
                            type="body-1"
                            style={styles.termNumber}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {index + 1}.
                        </Typography>
                        <Typography
                            type="body-1"
                            style={styles.termText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {term}
                        </Typography>
                    </View>
                ))}
                <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.termsButtonStyle}
                    onPress={onTnCClick}
                    testID={'promotional_banner_TnC_click'}>
                    <Typography
                        type="subhead-600"
                        style={styles.termsButtonTextStyle}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {'Read all terms and Conditions'}
                    </Typography>
                </TouchableOpacity>
            </View>

            {/* Action Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.primaryButton}
                    onPress={onButtonPress}
                    testID={'promotional_button_click'}>
                    <Typography
                        type="subhead-600"
                        style={styles.primaryButtonText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {buttonText}
                    </Typography>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    header: {
        padding: 10,
    },
    imageWithCouponCode: {
        backgroundColor: '#333131',
        paddingBottom: 10,
        borderRadius: 12,
        paddingHorizontal: 5,
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333131',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
    },
    imageContainer: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        width: '100%',
    },
    promoImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

        padding: 16,
    },
    movieTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 4,
    },
    offerText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
    couponContainer: {
        marginBottom: 24,
    },
    couponBox: {
        backgroundColor: '#FFFFFF29',
        borderRadius: 15,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10,
        flexWrap: 'wrap',
    },
    couponCode: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 1,
        flex: 1,
        marginRight: 8,
    },
    copyButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
    },
    copyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFD700',
    },
    termsSection: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginVertical: 24,
        borderRadius: 12,
    },
    termItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingLeft: 8,
    },
    termNumber: {
        fontSize: 14,
        color: '#666666',
        marginRight: 8,
        minWidth: 20,
    },
    termText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        flex: 1,
    },
    termsLink: {
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    termsLinkText: {
        fontSize: 14,
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    termsButtonStyle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    termsButtonTextStyle: {
        color: '#004FB6',
    },
    buttonContainer: {
        paddingBottom: 20,
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#2C2C2C',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: '600',
    },
});
