import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { RideId } from '@/typescript/state/client/booking';
import mt_ic_non_ac from '@/typescript/assets/ny-service/mt_ic_non_ac.webp';
import mt_ic_ac_logo from '@/typescript/assets/ny-service/mt_ic_ac_logo.webp';
import colors from '@/typescript/designSystem/colorPalette/';
import { truncateDriverName } from '@/src-v2/utils/common';
import { useDriverPhotoUri } from '@/typescript/hooks/useDriverPhotoUri';

type RatingDriverInfoTypes = {
    driverName: string;
    vehicleVariant: string;
    rideId: RideId | null;
    isAcRide: boolean | undefined;
    driverImage: string | undefined;
};

const RatingDriverInfo = ({ driverName, vehicleVariant, isAcRide, driverImage }: RatingDriverInfoTypes) => {
    const truncatedDriverName = truncateDriverName(driverName);
    const driverPhotoUri = useDriverPhotoUri(driverImage);

    const renderVehicleVariant = () => {
        if (vehicleVariant.toLowerCase() === 'auto') {
            return (
                <Typography
                    type="sub-body-700"
                    style={styles.vehicleVariant}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {vehicleVariant}
                </Typography>
            );
        }

        return (
            <View style={styles.variantContainer}>
                <Image
                    accessible={true}
                    accessibilityLabel={isAcRide ? 'ac logo image' : 'non ac logo image'}
                    source={isAcRide ? mt_ic_ac_logo : mt_ic_non_ac}
                    style={styles.acIcon}
                />
                <Typography
                    type="sub-body-700"
                    style={styles.vehicleVariant}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {vehicleVariant}
                </Typography>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.driverInfoSection}>
                {/* Driver Image */}
                <Image
                    accessible={true}
                    accessibilityLabel="driver avatar image"
                    style={styles.driverImage}
                    source={{ uri: driverPhotoUri }}
                />
                <View style={styles.textContainer}>
                    <Typography
                        type="subhead-800"
                        style={styles.driverName}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {truncatedDriverName}
                    </Typography>
                    {renderVehicleVariant()}
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
        justifyContent: 'space-between',
    },
    driverImage: {
        width: 58,
        height: 48,
        borderRadius: 24,
    },
    driverInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flexDirection: 'column',
        marginLeft: 16,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    driverName: {
        fontSize: 18,
        fontWeight: '800',
    },
    vehicleVariant: {
        lineHeight: 18,
        marginTop: 4,
        fontSize: 14,
        color: colors.primitive.gray[17],
    },
    variantContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    acIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
    },
});

export default RatingDriverInfo;
