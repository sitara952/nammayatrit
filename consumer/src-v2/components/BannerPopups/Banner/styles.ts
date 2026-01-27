import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        marginHorizontal: 4,
        marginVertical: 10,
        borderColor: '#F3F3F3',
    },
    leftSectionWrapper: {
        flexShrink: 1,
        flexGrow: 1,
        justifyContent: 'space-between',
        marginRight: 8,
    },
    imageWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftSection: {
        flex: 1,
        padding: 20,
        paddingRight: 10,
        justifyContent: 'space-between',
    },
    bannerContainer: {
        flexDirection: 'row',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 18,
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    button: {
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
        paddingHorizontal: 10,
        minWidth: 60,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '800',
        lineHeight: 18,
    },
    imageCenter: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
    },
    imageFlexDown: {
        width: 110,
        height: 110,
        borderRadius: 10,
        marginRight: 20,
        resizeMode: 'cover',
    },
});
