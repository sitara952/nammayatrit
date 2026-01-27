import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const DriverProfileGradient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <LinearGradient
            style={[ViewStyleSheet._container]}
            colors={[themeColors.Gradiant_color, `${themeColors.Gradiant_color}80`, 'rgba(255, 255, 255, 1)']}
            locations={[0.1, 0.19, 0.68]}
            start={{ x: 0.42, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {children}
        </LinearGradient>
    );
};
const ViewStyleSheet = StyleSheet.create({
    _container: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
    },
});

export default DriverProfileGradient;
