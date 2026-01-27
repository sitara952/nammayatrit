import { StyleSheet } from 'react-native';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';

export const headingStyles = StyleSheet.create({
    marginBottom: { marginBottom: 12 },
    headingContainer: {
        marginTop: 7,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    paddingBottom: {
        paddingHorizontal: 6,
        paddingTop: 19,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        width: '50%',
        flexShrink: 1,
    },
    fullWidth: {
        width: '100%',
    },
    partialWidth: {
        flex: 1,
        flexShrink: 1,
    },
    titleText: {
        fontFamily: 'AreaNormal-Black',
        lineHeight: 21,
        fontSize: 16,
    },
    subTitleContainer: {
        marginTop: 'auto',
        paddingTop: 8,
    },
    notifyText: {
        color: `${defaultColors.gray600}`,
    },
    vehicleNumberContainer: {
        borderRadius: 6.8,
        height: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: defaultColors.gray400,
        backgroundColor: defaultColors.yellow700,
        paddingHorizontal: 8,
        marginBottom: 2,
        maxWidth: 135,
    },
    vehicleNumberText: {
        color: '#302F2F',
        fontSize: 12,
        fontFamily: 'AreaNormal-Regular',
        flexShrink: 0,
        includeFontPadding: false,
    },
    otpContainer: {
        paddingTop: 10.5,
        paddingBottom: 9,
        paddingHorizontal: 10,
        borderRadius: 30,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpShadow: {
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 0.2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    otpText: {
        fontFamily: 'AreaNormal-Extrabold',
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 0.41,
    },
    darkText: {
        color: defaultColors.gray550,
    },
    emergencyContactsContainer: {
        paddingBottom: 13,
        marginTop: -16,
    },
    divider: {
        marginBottom: 20,
        backgroundColor: 'transparent',
        marginTop: 20,
    },
    showMoreButton: {
        paddingHorizontal: 12,
        zIndex: 100,
        backgroundColor: 'transparent',
    },
    showMoreContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 5,
    },
    showMoreText: {
        color: `${defaultColors?.black600}`,
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'AreaNormal-Regular',
        fontWeight: 700,
    },
    endOtpText: {
        color: `${defaultColors?.gray600}`,
        fontSize: 10,
        lineHeight: 12,
    },
    endRideOtpContainer: {
        backgroundColor: '#fff',
    },
    endOtpValue: {
        color: `${defaultColors?.gray600}`,
        fontSize: 16,
    },
    addOrEditStopButtonContainer: {
        backgroundColor: '#519856',
        borderRadius: 9999,
    },
    addOrEditStopButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
    },
    rentalTitleText: {
        color: defaultColors.green100,
    },
    vehicleNumberFont: {
        fontFamily: 'FE-Font',
    },
    flexRow: {
        flexDirection: 'row',
    },
});
