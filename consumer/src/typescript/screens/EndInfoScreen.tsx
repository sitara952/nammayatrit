import React, { useEffect, useRef } from 'react';
import Animated, {
    runOnJS,
    StretchInY,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { StackScreenProps } from '@react-navigation/stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { CoreColors } from 'config-types/src/domain/default/themes/types';
import { StyleSheet } from 'react-native';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { BottomSheetStage, setBottomSheetStage } from '../state/client/session';
import { useAppDispatch } from '../state/hooks';

export interface EndInfoScreenProps {
    mainText: string | undefined;
    showMainText: boolean;
    children: React.JSX.Element | null;
    logoCenter: number | undefined;
    goTo: (() => void) | undefined;
    showGoBack: boolean;
    showButton: boolean;
    logo: React.JSX.Element;
    bgcolor: string | undefined;
    mainTextColor: string | CoreColors;
}

type InfoProps = StackScreenProps<MainNavigationParamList, 'EndInfoScreen'>;

const EndInfoScreen = ({ route, navigation }: InfoProps) => {
    const {
        bgcolor = colors.orange800,
        mainTextColor,
        mainText = '',
        showMainText,
        children = null,
        logoCenter = 50,
        showButton,
        logo,
        goTo = () => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'mainTabNavigation' }],
            });
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'endInfoScreen' }));
        },
        showGoBack = false,
    } = route.params;
    const { bottom } = useSafeAreaInsets();
    const dispatch = useAppDispatch();

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const scale = useSharedValue(1);

    const hasNavigated = useRef(false);
    const safeGoTo = () => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        goTo();
    };

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
            6,
            true,
            () => {
                runOnJS(safeGoTo)();
            },
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scale.value,
                },
            ],
        };
    });

    return (
        <Animated.View style={[{ height: '100%', backgroundColor: bgcolor }]}>
            <Animated.View style={styles.body1}>
                <Animated.View style={[styles.body2, { marginTop: logoCenter }]}>
                    <Animated.View style={[animatedStyle]}>{logo}</Animated.View>
                    {showMainText && (
                        <Typography
                            type="subhead-4"
                            style={[{ color: `${mainTextColor}` }, styles.mainText]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {mainText}
                        </Typography>
                    )}
                    {children}
                </Animated.View>
                {showButton && (
                    <Animated.View
                        style={{
                            width: '100%',
                            bottom: bottom + 10,
                            position: 'absolute',
                        }}>
                        <Button
                            testID="GoHomeRideNotFound"
                            textType="subhead-1"
                            textStyle={{ fontSize: 16.5 }}
                            textColor="black"
                            entering={StretchInY.duration(300)}
                            type="primary"
                            size="lg"
                            style={styles.bottomButton}
                            text={showGoBack ? userLanguageStrings.GoBack : userLanguageStrings.GoHome}
                            onPress={safeGoTo}
                        />
                    </Animated.View>
                )}
            </Animated.View>
        </Animated.View>
    );
};

export default React.memo(EndInfoScreen);

const styles = StyleSheet.create({
    body1: { height: '100%', marginHorizontal: 20 },
    body2: {
        height: 600,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    mainText: {
        textAlign: 'center',
        fontFamily: 'AreaNormal-Bold',
        fontSize: 18,
        lineHeight: 20,
    },
    bottomButton: {
        justifyContent: 'center',
        backgroundColor: 'white',
    },
});
