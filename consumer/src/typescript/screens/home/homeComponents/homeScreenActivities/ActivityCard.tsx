import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import TouchEffect from '@/typescript/screens/home/homeComponents/sharedRides/TouchEffect';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Icon } from '@/typescript/components/Icon';
import ArrowRightV2 from '@/typescript/components/svg/ArrowRightV2';
import { FadeLoop } from '@/typescript/components/FadeLoop';
import { colors } from 'config-types/src/domain/default/themes/colors';

interface ActivityCardProps {
    title: string;
    subtitle: string | undefined;
    onPress: () => void;
    style?: StyleProp<ViewStyle> | undefined;
    rightComponent?: React.ReactNode | undefined;
    testID: string;
    activityStatus: ActivityStatus | undefined;
}

export type ActivityStatus = 'live' | 'upcoming';

type PillConfig = {
    [key in ActivityStatus]: {
        backgroundColor: string;
        text: string;
        showDot: boolean;
    };
};

const pillConfig: PillConfig = {
    live: {
        backgroundColor: colors.red500,
        text: 'Live Now',
        showDot: true,
    },
    upcoming: {
        backgroundColor: colors.orange500,
        text: 'Upcoming',
        showDot: false,
    },
};

const ActivityCard = ({
    title,
    subtitle,
    onPress,
    style,
    rightComponent,
    testID,
    activityStatus,
}: ActivityCardProps) => {
    const pillStatusConfig = activityStatus ? pillConfig[activityStatus] : undefined;
    return (
        <TouchEffect
            onPress={onPress}
            effects={['scale']}
            testID={testID}
            accessible={undefined}
            accessibilityLabel={undefined}
            style={undefined}>
            {activityStatus && (
                <View style={[styles.topTileContainer, { backgroundColor: pillStatusConfig?.backgroundColor }]}>
                    <View style={styles.pillContainer}>
                        {pillStatusConfig?.showDot && (
                            <FadeLoop>
                                <View style={styles.dot} />
                            </FadeLoop>
                        )}
                        <Typography
                            style={styles.pillText}
                            numberOfLines={1}
                            type={'body-2'}
                            isAnimate={undefined}
                            accessible={true}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {pillStatusConfig?.text}
                        </Typography>
                    </View>
                </View>
            )}
            <View
                style={[
                    styles.container,
                    style,
                    { marginTop: activityStatus ? 12 : 0 }, // gap between top tile and card
                ]}>
                <View style={styles.textContainer}>
                    <Typography
                        style={styles.title}
                        numberOfLines={subtitle ? 1 : 2}
                        type={'subhead-1'}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            style={styles.subTitle}
                            numberOfLines={1}
                            type={'body-1'}
                            isAnimate={undefined}
                            accessible={true}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {subtitle}
                        </Typography>
                    )}
                </View>
                {rightComponent ?? (
                    <View style={styles.iconContainer}>
                        <Icon icon={<ArrowRightV2 />} size={13} />
                    </View>
                )}
            </View>
        </TouchEffect>
    );
};

export default ActivityCard;

const styles = StyleSheet.create({
    topTileContainer: {
        justifyContent: 'center',
        position: 'absolute',
        paddingHorizontal: 14,
        paddingVertical: 2,
        borderRadius: 20,
        zIndex: 1,
        marginLeft: 18,
    },
    container: {
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 13,
        paddingBottom: 13,
        paddingLeft: 18,
        paddingRight: 14,
        flexDirection: 'row',
        zIndex: 0,
    },
    textContainer: {
        justifyContent: 'center',
    },
    title: {
        color: colors.black900,
        maxWidth: 210,
    },
    subTitle: {
        color: colors.gray300,
        marginTop: 4,
        maxWidth: 210,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.yellow450,
        height: 34,
        width: 44,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginLeft: 8,
        alignSelf: 'center',
    },
    dot: {
        backgroundColor: colors.white,
        width: 5,
        height: 5,
        borderRadius: 10,
        marginRight: 4,
    },
    pillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pillText: {
        color: colors.white,
        fontSize: 12,
    },
});
