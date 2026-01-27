import { StyleSheet } from 'react-native';

export const noRidesContainerStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginBottom: 50,
    },
    errorContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        height: 192,
        width: 144,
    },
    subhead: {
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
        marginHorizontal: 16,
        lineHeight: 24,
    },
    callout: {
        color: '#5B6777',
        marginBottom: 4,
        marginHorizontal: 16,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export const rideContainterStyles = StyleSheet.create({
    myRidesView: {
        flex: 1,
    },
    bookingsContainer: {
        flex: 1,
        paddingHorizontal: 4,
    },
    bookingsFlatList: {
        paddingHorizontal: 16,
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        marginRight: 6,
    },
    filterButtonLast: {
        marginRight: 0,
        marginLeft: 6,
    },
    filterButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterButtonText: {
        fontSize: 14,
    },
});
