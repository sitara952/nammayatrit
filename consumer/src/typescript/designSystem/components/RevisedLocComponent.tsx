import { View, StyleSheet } from 'react-native';
import Typography from './primitives/Typography';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import ContentLoader from './ContentLoader';
import { Rect } from 'react-native-svg';

interface RevisedLocProps {
    title?: string;
    desc?: string;
    iconColor?: string;
    isLoading?: boolean;
}

const RevisedLocComponent = (props: RevisedLocProps) => {
    const { title, desc, isLoading } = props;
    return (
        <View style={style.container}>
            <View style={{ flex: 1 }}>
                {isLoading ? (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <ContentLoader height={24} width={'50%'}>
                            <Rect x="0" y="0" rx={8} ry="8" width="100%" height="22" />
                        </ContentLoader>
                        <ContentLoader height={24} width={'100%'} style={{ marginTop: 2 }}>
                            <Rect x="0" y="0" rx="8" ry="8" width="100%" height="22" />
                        </ContentLoader>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Typography
                            numberOfLines={1}
                            type="subhead-800"
                            style={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>{`${title}`}</Typography>
                        <Typography
                            numberOfLines={1}
                            type="body-1"
                            style={{ marginTop: 4, color: '#746F79' }}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>{`${desc}`}</Typography>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

export default RevisedLocComponent;

const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        marginVertical: 10,
        flexDirection: 'row',
    },
});
