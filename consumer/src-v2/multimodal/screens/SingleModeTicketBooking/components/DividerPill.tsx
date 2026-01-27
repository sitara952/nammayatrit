import { LinearGradient } from 'react-native-linear-gradient';
import { StyleSheet, View } from 'react-native';

type DividerPillProps = {
    children: React.ReactNode | undefined;
    style: object | undefined;
    offset: number | undefined;
};

export const DividerPill = ({ children, style, offset = 10 }: DividerPillProps) => {
    return (
        <View style={[styles.container, { marginVertical: offset }]}>
            <LinearGradient
                colors={['#D9D9D900', '#454446', '#D9D9D900']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                locations={[0, 0.515, 1]}
                style={[styles.gradient, style]}
            />
            {children && <View style={styles.childrenContainer}>{children}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
        height: 1, // Default container height matches gradient height
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        width: '100%',
        height: 1,
        position: 'absolute',
    },
    childrenContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center', // Center horizontally
        justifyContent: 'center', // Center vertically
        zIndex: 1,
    },
});
