import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import Divider from './primitives/Divider';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../../designSystem/tokens';
import { metersToKilometers } from '../../utils/common';
import Svg, { Rect } from 'react-native-svg';
import { Icon } from '@/typescript/components/Icon';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { CarSide } from '@/typescript/components/svg/CarSide';
import LinearGradient from 'react-native-linear-gradient';
import Typography from './primitives/Typography';
import { secToHrMin } from '../../utils/common';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
interface RentalDetailsProps {
    state: 'yetToStart' | 'inProgress' | 'ended';
    elapsedTime: number;
    totalTime: number;
    nextStop?: string;
    estimateDistance: number;
    onEditAddStop: () => void;
}

const RentalDetails: React.FC<RentalDetailsProps> = ({
    state,
    elapsedTime,
    totalTime,
    nextStop,
    estimateDistance,
    onEditAddStop,
}) => {
    // Animation setup
    const progress = useSharedValue(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Animate progress bar width based on the state
    // TODO: move to useDerivedValue
    React.useEffect(() => {
        if (state === 'inProgress' || state === 'ended') {
            const progressValue = Number(elapsedTime) / Number(totalTime);
            progress.value = withTiming(progressValue, { duration: 1000 });
        } else {
            progress.value = withTiming(0, { duration: 500 });
        }
    }, [state, elapsedTime, totalTime]);

    const animatedProgressBarStyle = useAnimatedStyle(() => ({
        width: interpolate(progress.value * 100, [0, 100], [47, SCREEN_WIDTH - 32 - 32], Extrapolation.CLAMP),
    }));

    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    progress.value * 100,
                    [0, 100],
                    [0, SCREEN_WIDTH - 32 - 32 - 43 - 4],
                    Extrapolation.CLAMP,
                ),
            },
        ],
    }));

    return (
        <View style={styles.container}>
            <Typography
                style={styles.title}
                type={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.RentalDetails}
            </Typography>

            {/* Animated Progress Bar */}
            <View style={styles.progressBarBackground}>
                <Typography
                    type="callout-1"
                    style={tailwind.style(`z-2 absolute left-4 top-2 text-black`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {state === 'yetToStart'
                        ? ''
                        : Number(elapsedTime) > Number(totalTime)
                          ? `${secToHrMin(totalTime)} + ${secToHrMin(elapsedTime - totalTime)}`
                          : `${secToHrMin(elapsedTime)}`}
                </Typography>
                <Typography
                    type="callout-1"
                    style={tailwind.style(
                        `z-2 absolute right-4 top-2 ${progress.value * 100 > 94 ? 'text-black' : 'text-[#655C6F]'}`,
                    )}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityRole={undefined}
                    accessibilityLabel={undefined}>
                    {state === 'yetToStart'
                        ? 'Yet to start'
                        : Number(elapsedTime) > Number(totalTime)
                          ? ``
                          : `${secToHrMin(totalTime)}`}
                </Typography>
                <Icon
                    icon={<DiamondSvg />}
                    style={tailwind.style(`absolute right-[${(SCREEN_WIDTH - 32 - 32) / 2}px] top-3 z-2`)}
                />
                {Number(elapsedTime) > Number(totalTime) ? (
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={['#F9D765', '#F9D765', '#FA8724']}
                        style={[styles.linearGradient]}></LinearGradient>
                ) : (
                    <></>
                )}

                <Animated.View
                    style={[
                        styles.progressBar,
                        animatedProgressBarStyle,
                        {
                            backgroundColor: Number(elapsedTime) <= Number(totalTime) ? '#F9D758' : 'transparent',
                        },
                    ]}></Animated.View>
                <Animated.View
                    style={[
                        tailwind.style(
                            'w-[43px] h-[32px] bg-[#FFFFFF] rounded-[17px] flex-row items-center justify-center z-20 mt-[2px] ml-[2px] absolute',
                        ),
                        animatedThumbStyle,
                    ]}>
                    <Icon icon={<CarSide fill={undefined} />} size={24} color="#14171F" />
                </Animated.View>
            </View>

            {/* Time Covered */}
            <View style={styles.distanceContainer}>
                <Text style={styles.statusText}>{userLanguageStrings.distanceIncluded}</Text>
                <View style={styles.timeRow}>
                    {/* <Text
            style={
              (styles.totalTimeText,
              {color: elapsedTime > totalTime ? '#FA2424' : '#5B6777'})
            }>
            {secToHrMin(elapsedTime)}
          </Text>
          <Text>/ </Text> */}
                    <Typography
                        type="callout-1"
                        style={(styles.totalTimeText, { color: '#78747C' })}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {/* {secToHrMin(elapsedTime)} */}
                        {metersToKilometers(estimateDistance)}
                    </Typography>
                </View>
            </View>
            {/* <Divider type="dashed" /> */}
            <Animated.View style={tailwind.style(`py-[${token?.spacing?.[8]}]`)}>
                <Divider
                    type="dashed"
                    direction={undefined}
                    style={undefined}
                    labelPosition={undefined}
                    offset={undefined}
                    offsetBackground={undefined}
                    dividerColor={undefined}
                    strokeDashArray={undefined}
                />
            </Animated.View>
            <Typography
                style={styles.headingText}
                type={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.NextStop}
            </Typography>
            {/* Next Stop Section */}
            <View style={styles.nextStopContainer}>
                <ScrollView horizontal={true}>
                    <Typography
                        style={styles.nextStopText}
                        type={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {nextStop || userLanguageStrings.NotAddedYet}
                    </Typography>
                </ScrollView>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="7d45f1d5-a32a-401a-ae65-dd3e09936045"
                    onPress={onEditAddStop}>
                    <Typography
                        style={styles.actionText}
                        type={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {nextStop === undefined ? userLanguageStrings.AddStop : userLanguageStrings.EditStop}
                    </Typography>
                </TouchableOpacity>
            </View>
        </View>
    );
};
const DiamondSvg = () => {
    return (
        <Svg width={9} height={9} viewBox="0 0 9 9" fill="none">
            <Rect y={4.67188} width={6.60703} height={6.60703} rx={1} transform="rotate(-45 0 4.672)" fill="#fff" />
        </Svg>
    );
};
const styles = StyleSheet.create({
    linearGradient: {
        flex: 1,
    },
    container: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
    },
    title: {
        color: '#6B7280',
        marginBottom: 8,
        fontFamily: 'AreaNormal-Bold',
        fontSize: 14,
        lineHeight: 20,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    totalTimeText: {
        // color: '#5B6777',
        fontFamily: 'AreaNormal-Bold',
        fontSize: 14,
        lineHeight: 20,
        marginRight: 8,
    },
    elapsedTimeText: {
        color: '#6B7280',
        fontFamily: 'AreaNormal-Extrabold',
        fontSize: 14,
    },
    statusText: {
        color: '#6B7280',
        fontFamily: 'AreaNormal-Bold',
        fontSize: 14,
        lineHeight: 20,
    },
    headingText: {
        color: '#6B7280',
        fontFamily: 'AreaNormal-Bold',
        fontSize: 12,
        lineHeight: 16,
        paddingTop: 8,
    },
    carIconContainer: {
        width: 24,
        height: 16,
        backgroundColor: '#F97316',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    carIconDot: {
        width: 8,
        height: 8,
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    progressBarBackground: {
        height: 36,
        backgroundColor: '#E1E4E9',
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 18,
        position: 'absolute',
        top: 0,
    },
    distanceContainer: {
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    boldText: {
        fontWeight: 'bold',
    },
    nextStopContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    nextStopText: {
        color: '#000',
        fontFamily: 'AreaNormal-Extrabold',
        fontSize: 16,
        lineHeight: 24,
        flexShrink: 1,
    },
    actionText: {
        color: `${defaultColors.blue700}`,
        fontFamily: 'AreaNormal-Bold',
        fontSize: 16,
        lineHeight: 22,
        paddingHorizontal: 16,
    },
});

export default RentalDetails;
