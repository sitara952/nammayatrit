import { Pressable } from '@/src-v2/primitives/Pressable';
import { ServiceTag, ServiceTagConfig } from '@/src-v2/systems/configs/types';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { ServiceTag as ServiceTagItem } from './ServiceTag';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { memo } from 'react';
import {
    Image,
    ImageSourcePropType,
    ImageStyle,
    Platform,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, { SlideInRight, ZoomIn } from 'react-native-reanimated';
import colors from '../../designSystem/colorPalette';
import Typography from '../../designSystem/components/primitives/Typography';
import { useScaleAnimation } from '../../utils/useScaleAnimation';
import { useHomeActions } from '@/typescript/homeActions/useHomeActions';
import { ActionConfig } from '@/src-v2/systems/configs/types';

type ServiceOptionCardProps = {
    label: string;
    description: string;
    imgSrc: ImageSourcePropType;
    index: number;
    allowFlexGrow: boolean | undefined;
    serviceTag: ServiceTag;
    testID: string;
    entering: ZoomIn | SlideInRight | undefined;
    imageStyle: StyleProp<ImageStyle> | undefined;
    cardStyle: StyleProp<ViewStyle> | undefined;
    containerStyle: StyleProp<ViewStyle> | undefined;
    textStyle: StyleProp<TextStyle> | undefined;
    tagConfig: ServiceTagConfig | undefined;
    onClick: ActionConfig | undefined;
    onPressOverride: (() => void) | undefined;
};

const FlexGrowView = memo((props: ServiceOptionCardProps) => {
    const { label, description, imgSrc, textStyle } = props;
    return (
        <View style={[styles.flexContainer, styles.cardShadow]}>
            <Image accessible={false} resizeMode={'contain'} style={styles.flexedViewImageStyle} source={imgSrc} />
            <View style={styles.flexGrowTextContainer}>
                <Typography
                    type="subhead-3"
                    style={styles.descriptionStyle}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {description}
                </Typography>
                <Typography
                    type="body-6"
                    style={[styles.flexedViewDescription, textStyle]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {label}
                </Typography>
            </View>
        </View>
    );
});

const getImageTransformStyle = (label: ServiceTag): StyleProp<ImageStyle> => {
    switch (label) {
        case 'RENTAL':
            return { transform: [{ scale: 1.0 }, { translateY: 4 }] };
        case 'INTERCITY_BUS':
            return { transform: [{ scale: 1.05 }, { translateY: 2 }, { translateX: 8 }] };
        case 'INTERCITY':
            return { transform: [{ scale: 1.15 }, { translateY: 6 }, { translateX: -7 }] };
        case 'NAMMATRANSIT':
            return { transform: [{ scale: 0.82 }, { translateY: 16 }, { translateX: -7 }] };
        case 'INSTANT':
        case 'BUS':
        case 'METRO':
            return { transform: [{ scale: 1.25 }, { translateY: 6 }, { translateX: -20 }] };
        case 'BIKE_TAXI':
            return { transform: [{ scale: 1.3 }, { translateY: 6 }] };
        case 'DELIVERY':
        case 'AMBULANCE_SERVICE':
        case 'TICKETING':
            return { transform: [{ scale: 1.2 }] };
        case 'SCHEDULE':
            return { transform: [{ scale: 1 }] };
        case 'METRO_V2':
        case 'BUS_V2':
            return { transform: [{ scale: 1.25 }, { translateY: 6 }, { translateX: -20 }] };
        case 'BUS_HYBRID':
            return { transform: [{ scale: 1.55 }, { translateY: -3 }, { translateX: -6 }] };
        default:
            return {};
    }
};

const CenteredView = memo((props: ServiceOptionCardProps) => {
    const { label, imgSrc, imageStyle, serviceTag, tagConfig } = props;
    return (
        <View style={[styles.cardContainer]}>
            <View style={styles.labelContainer}>
                <Text numberOfLines={1} style={styles.labelStyle2}>
                    {label}
                </Text>
                {/* Render config-based tag if provided, otherwise fallback to hardcoded NAMMATRANSIT tag */}
                {tagConfig ? (
                    <ServiceTagItem config={tagConfig} />
                ) : serviceTag === 'NAMMATRANSIT' ? (
                    <View style={styles.newTagContainer}>
                        <Text style={styles.newTagText}>new</Text>
                    </View>
                ) : null}
            </View>
            <Animated.Image
                accessible={true}
                accessibilityLabel="service option card image"
                resizeMode={'contain'}
                style={[styles.imageStyle, getImageTransformStyle(serviceTag), imageStyle]}
                source={imgSrc}
            />
        </View>
    );
});

export const ServiceOptionCard = (props: ServiceOptionCardProps) => {
    const {
        index,
        label,
        description,
        imgSrc,
        allowFlexGrow,
        serviceTag,
        testID,
        entering,
        imageStyle,
        cardStyle,
        containerStyle,
        textStyle,
        tagConfig,
        onClick,
        onPressOverride,
    } = props;

    const { handlers } = useScaleAnimation();
    const { viewAllServicesRef } = useRefsContext();
    const { triggerHomeAction } = useHomeActions();

    const handleOnPress = () => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        viewAllServicesRef.current?.dismiss();

        if (onPressOverride) {
            onPressOverride();
            return;
        }

        if (!onClick) {
            console.warn('[ServiceOptionCard] No onClick provided');
            return;
        }

        triggerHomeAction(onClick.actionName, {
            source: serviceTag,
            actionData: onClick.actionData,
        });
    };

    return (
        <Animated.View style={[styles.flex1, containerStyle]}>
            <Pressable
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel={label + ' button'}
                onPress={handleOnPress}
                {...handlers}>
                {allowFlexGrow ? (
                    <FlexGrowView
                        index={index}
                        key={index + label}
                        label={label}
                        imgSrc={imgSrc}
                        allowFlexGrow={allowFlexGrow}
                        description={description}
                        serviceTag={serviceTag}
                        testID="service_card_flex_grow_view"
                        entering={entering}
                        imageStyle={imageStyle}
                        cardStyle={cardStyle}
                        containerStyle={undefined}
                        textStyle={textStyle}
                        tagConfig={tagConfig}
                        onClick={onClick}
                        onPressOverride={onPressOverride}
                    />
                ) : (
                    <CenteredView
                        index={index}
                        key={index + label}
                        label={label}
                        imgSrc={imgSrc}
                        allowFlexGrow={allowFlexGrow}
                        description={description}
                        serviceTag={serviceTag}
                        testID="service_card_centered_view"
                        entering={entering}
                        imageStyle={imageStyle}
                        cardStyle={cardStyle}
                        containerStyle={undefined}
                        textStyle={textStyle}
                        tagConfig={tagConfig}
                        onClick={onClick}
                        onPressOverride={onPressOverride}
                    />
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '' + `${colors?.recovered?.neutralMax}` + '0A',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
    labelContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 12,
    },
    labelStyle2: {
        color: colors?.recovered?.neutralUltraHigh,
        fontSize: 15,
        lineHeight: 17,
        textAlign: 'center',
        paddingHorizontal: 7,
        fontFamily: 'AreaNormal-Extrabold',
        paddingTop: 5,
    },
    labelStyle3: {
        color: '#656565',
        paddingHorizontal: 7,
        fontSize: 9,
        lineHeight: 12,
        textAlign: 'center',
        fontFamily: 'AreaNormal-Bold',
        paddingTop: 3,
    },
    descriptionStyle: {
        textAlign: 'right',
        color: colors?.recovered?.neutralHigh,
    },
    flexedViewImageStyle: {
        height: 82,
        width: '50%',
        textAlign: 'right',
    },
    imageStyle: {
        height: 50,
        width: '100%',
        resizeMode: 'contain',
        bottom: 0,
        padding: 2,
        position: 'absolute',
    },
    flexContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingHorizontal: 16,
        height: '100%',
    },
    flexGrowTextContainer: {
        flex: 1,
        justifyContent: 'center',
        height: '100%',
    },
    flexedViewDescription: {
        textAlign: 'right',
        marginTop: 4,
    },
    cardContainer: {
        flexDirection: 'column',
        alignSelf: 'center',
        width: '100%',
        height: '100%',
    },
    flex1: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#F5F5F5' : undefined,
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 1,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F5F5F5',
    },
    newTagContainer: {
        backgroundColor: '#8F26FF',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        alignSelf: 'center',
        marginTop: 7,
    },
    newTagText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontFamily: 'AreaNormal-ExtraBold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
});
