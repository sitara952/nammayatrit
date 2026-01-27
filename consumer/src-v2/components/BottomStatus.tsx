import { ImageSourcePropType, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../tailwind-theme/tailwind';
import { colors as configColors } from 'config-types/src/domain/default/themes/colors';

const BottomStatus = ({ imgStatus, description }: { imgStatus: ImageSourcePropType; description: string }) => {
    return (
        <Animated.View
            style={{
                width: '100%',
                position: 'absolute',
                top: 18,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
            }}>
            <Animated.View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 16,
                    justifyContent: 'center',
                    padding: 8,
                    paddingHorizontal: 16,
                    backgroundColor: configColors.red800,
                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: 5,
                    },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    // elevation: 4,
                    // gap: 4,
                }}>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="status image"
                    source={imgStatus}
                    style={{ width: 16, height: 16, right: 8, top: 1 }}
                    resizeMode="contain"
                    tintColor="white"
                />
                <Animated.Text
                    numberOfLines={1}
                    style={[
                        { color: 'white', fontSize: Platform.OS === 'ios' ? 16 : 15 },
                        tailwind.style('font-areaNormal-extrabold'),
                    ]}>
                    {description}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
};

export default BottomStatus;
