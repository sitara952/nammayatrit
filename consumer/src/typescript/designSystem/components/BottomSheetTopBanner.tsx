import { disability } from '@/readOnly/api/types/Disability.gen';
import { Info } from '@/src-v2/multimodal/components/svg/Info';
import { AnimationProps } from '@/src-v2/primitives/Button';
import { Pressable } from '@/src-v2/primitives/Pressable';
import ChevronRight from '@/typescript/assets/svg/symbols/ChevronRight';
import { Icon } from '@/typescript/components/Icon';
import PetPaws from '@/typescript/components/PetPaws';
import { ShieldCheck } from '@/typescript/components/svg/ShieldCheck';
import { ShieldPlus } from '@/typescript/components/svg/ShieldPlus';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { Image, View } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import nyIcInfoWhite from '@/typescript/assets/ny_ic_white_info.webp';
import { selectIsPetRide } from '@/typescript/state/client/search';
import { BottomSheetStage } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { colors } from 'config-types/src/domain/default/themes/colors';
import React, { useMemo } from 'react';
import { Text } from 'react-native';
import Animated, { SharedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SpecialPickUpLocationPin } from '../../components/svg/confirmPickup/SpecialPickupLocationPin';
import BusinessTrip from '@/typescript/assets/svg/symbols/BusinessTrip';
import PetRide from '@/typescript/assets/svg/symbols/PetRide';
import Typography from './primitives/Typography';

// Define constants for our custom colors
const PET_RIDE_BANNER_COLOR = '#ECEDEF';

export enum BottomSheetTopBannerType {
    Blind,
    Deaf,
    Locomotor,
    OtherDisability,
    SpecialAssistanceOff,
    SpecialPickUpLocation,
    FollowRideSosOn,
    FollowRideSosSafe,
    RideConfirmedSosOn,
    RideInsurance,
    PetRide,
    RideConfirmedPetRide,
    BusinessRide,
    MultipleSelections,
    BETA,
}

interface BottomSheetTopBannerProps extends BottomSheetHandleProps, AnimationProps {
    bannerType?: BottomSheetTopBannerType;
    onBannerPress?: (bannerType: BottomSheetTopBannerType | undefined) => void;
    showHandle?: boolean;
    showInfo?: boolean;
    hideAccessibility?: boolean;
    animatedIndex: SharedValue<number>;
    showCircleInfo?: boolean;
    postIcon?: boolean;
    handlerBGColor: string;
}

const PetAnimation = React.memo(() => {
    const isPetRide = useAppSelector(state => selectIsPetRide(state, null));
    return <PetPaws isLottieEnabled={isPetRide} />;
});

const BottomSheetTopBanner_: React.FC<BottomSheetTopBannerProps> = ({
    onBannerPress,
    bannerType,
    showHandle,
    showInfo,
    hideAccessibility = false,
    entering,
    exiting,
    showCircleInfo = false,
    postIcon = false,
    handlerBGColor = '#F8F9FB',
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const { bottomSheetTopBannerRef } = useRefsContext();
    const isPetRide = useAppSelector(state => selectIsPetRide(state, null));

    const getBannerText = (): string => {
        switch (bannerType) {
            case BottomSheetTopBannerType.RideInsurance:
                return userLanguageStrings.YourRideComesWithFreeInsurance;
            case BottomSheetTopBannerType.Blind:
                return userLanguageStrings.SpecialAssistance + ': ' + userLanguageStrings.BlindAndLowVision;
            case BottomSheetTopBannerType.Deaf:
                return (
                    userLanguageStrings.SpecialAssistance +
                    ': ' +
                    userLanguageStrings.On +
                    ' • ' +
                    userLanguageStrings.Deaf
                );
            case BottomSheetTopBannerType.Locomotor:
                return (
                    userLanguageStrings.SpecialAssistance +
                    ': ' +
                    userLanguageStrings.On +
                    ' • ' +
                    userLanguageStrings.Locomotor
                );
            case BottomSheetTopBannerType.OtherDisability:
                return userLanguageStrings.SpecialAssistance + ': ' + userLanguageStrings.On;
            case BottomSheetTopBannerType.SpecialAssistanceOff:
                return userLanguageStrings.SpecialAssistance + ': ' + userLanguageStrings.Off;
            case BottomSheetTopBannerType.SpecialPickUpLocation:
                return userLanguageStrings.SpecialPickupZone + '  |';
            case BottomSheetTopBannerType.FollowRideSosOn:
                return userLanguageStrings.SOSTriggeredTakeActionsIfNeeded;
            case BottomSheetTopBannerType.FollowRideSosSafe:
                return userLanguageStrings.Ridemarkedassafe;
            case BottomSheetTopBannerType.RideConfirmedSosOn:
                return 'SOS triggered';
            case BottomSheetTopBannerType.PetRide:
                return userLanguageStrings.Ridewithyourpet;
            case BottomSheetTopBannerType.RideConfirmedPetRide:
                return userLanguageStrings.YouAreRidingWithAPet;
            case BottomSheetTopBannerType.BusinessRide:
                return userLanguageStrings.BusinessModeActive;
            case BottomSheetTopBannerType.MultipleSelections:
                return userLanguageStrings.MultipleSelectionsAreActive;
            case BottomSheetTopBannerType.BETA:
                return userLanguageStrings.CurrentlyinBETA;
            default:
                return '';
        }
    };

    const getBannerAdditionalText = (): string => {
        switch (bannerType) {
            case BottomSheetTopBannerType.SpecialPickUpLocation:
                return userLanguageStrings.LearnMore;
            default:
                return '';
        }
    };

    const thumbAnimated = useSharedValue(isPetRide ? 1 : 0);

    const SPRING_CONFIG = {
        mass: 0.8,
        damping: 15,
        stiffness: 150,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
    };

    React.useEffect(() => {
        thumbAnimated.value = withSpring(isPetRide ? 1 : 0, SPRING_CONFIG);
    }, [isPetRide]);

    const getBackgroundColor = useMemo(() => {
        switch (bannerType) {
            case BottomSheetTopBannerType.RideInsurance:
                return colors.blue400;
            case BottomSheetTopBannerType.SpecialPickUpLocation:
                return colors.green820;
            case BottomSheetTopBannerType.FollowRideSosOn:
            case BottomSheetTopBannerType.RideConfirmedSosOn:
                return colors.orange800;
            case BottomSheetTopBannerType.FollowRideSosSafe:
                return colors.green850;
            case BottomSheetTopBannerType.PetRide:
                return isPetRide ? '#FFE688' : PET_RIDE_BANNER_COLOR;
            case BottomSheetTopBannerType.RideConfirmedPetRide:
                return isPetRide ? '#FFE688' : PET_RIDE_BANNER_COLOR;
            case BottomSheetTopBannerType.BusinessRide:
                return '#C4DBFF';
            case BottomSheetTopBannerType.MultipleSelections:
                return '#454C55';
            case BottomSheetTopBannerType.BETA:
                return '#D2EFFF';
            default:
                return '#974DFF';
        }
    }, [bannerType, isPetRide]);

    const IconType = useMemo((): React.JSX.Element | null => {
        switch (bannerType) {
            case BottomSheetTopBannerType.SpecialPickUpLocation:
                return <Icon icon={<SpecialPickUpLocationPin fillColor={undefined} />} size={18} />;
            case BottomSheetTopBannerType.FollowRideSosOn:
            case BottomSheetTopBannerType.RideConfirmedSosOn:
                return <Icon icon={<ShieldPlus stroke={colors.orange800} />} />;
            case BottomSheetTopBannerType.FollowRideSosSafe:
                return <Icon icon={<ShieldCheck fill="white" />} />;
            case BottomSheetTopBannerType.RideInsurance:
                return <Icon icon={<ShieldCheck fill="white" />} />;
            case BottomSheetTopBannerType.PetRide:
            case BottomSheetTopBannerType.RideConfirmedPetRide:
                return <PetAnimation />;
            case BottomSheetTopBannerType.BusinessRide:
                return <Icon icon={<BusinessTrip color="#FFFFFF" backgroundColor="#004FB6" />} size={22} />;
            case BottomSheetTopBannerType.MultipleSelections:
                return (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 24, height: 24 }}>
                            <Icon icon={<BusinessTrip color="#454C55" backgroundColor="#F1F2F7" />} size={22} />
                        </View>
                        <View style={{ width: 24, height: 24, marginLeft: -8 }}>
                            <PetRide color="#454C55" backgroundColor="#F1F2F7" />
                        </View>
                    </View>
                );
            case BottomSheetTopBannerType.BETA:
                return <Icon icon={<Info fill={themeColors.Text_info} />} size={14} />;
            default:
                return null;
        }
    }, [bannerType, themeColors.Text_info]);

    const getFontSize = useMemo(() => {
        switch (bannerType) {
            case BottomSheetTopBannerType.BETA:
                return 14;
            default:
                return 13;
        }
    }, [bannerType]);

    const getFontWeight = useMemo(() => {
        switch (bannerType) {
            case BottomSheetTopBannerType.BETA:
                return 700;
            default:
                return 600;
        }
    }, [bannerType]);

    const getTextColor = useMemo(() => {
        switch (bannerType) {
            case BottomSheetTopBannerType.BETA:
                return themeColors.Text_info;
            case BottomSheetTopBannerType.BusinessRide:
                return '#000000';
            case BottomSheetTopBannerType.MultipleSelections:
                return '#FFFFFF';
            default:
                return '#FFFFFF';
        }
    }, [bannerType, themeColors.Text_info]);

    const isSosBanner = bannerType === BottomSheetTopBannerType.RideConfirmedSosOn;
    const isPetBanner = bannerType === BottomSheetTopBannerType.PetRide;
    const isInsuranceBanner = bannerType === BottomSheetTopBannerType.RideInsurance;
    const isRideConfirmedPetBanner = bannerType === BottomSheetTopBannerType.RideConfirmedPetRide;
    const isBusinessBanner =
        bannerType === BottomSheetTopBannerType.BusinessRide ||
        bannerType === BottomSheetTopBannerType.MultipleSelections;
    const isBetaBanner = bannerType === BottomSheetTopBannerType.BETA;
    const shouldCenterContent = isSosBanner || isRideConfirmedPetBanner || isBetaBanner || isBusinessBanner;

    const shouldShowBanner = bottomSheetTopBannerRef.current && bannerType !== undefined;

    return (
        <>
            {shouldShowBanner ? (
                <Animated.View
                    entering={entering}
                    exiting={exiting}
                    accessibilityElementsHidden={hideAccessibility}
                    importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}
                    style={[
                        {
                            width: '100%',
                            flexDirection: 'column',
                            borderTopLeftRadius: 34,
                            borderTopRightRadius: 34,
                            position: 'relative',
                            backgroundColor: getBackgroundColor,
                        },
                    ]}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Bottom Sheet Top Banner button"
                        testID="453d3e97-c393-4c27-9a95-9506cfdeede0"
                        onPress={() => {
                            if (
                                bannerType !== undefined &&
                                !isPetBanner &&
                                !isRideConfirmedPetBanner &&
                                !isBusinessBanner
                            ) {
                                onBannerPress && onBannerPress(bannerType);
                            }
                        }}>
                        <Animated.View
                            style={{
                                zIndex: -100,
                                width: '100%',
                                paddingTop: isBetaBanner ? 5 : 13,
                                paddingBottom: isBetaBanner ? 5 : 10,
                                flexDirection: 'row',
                                paddingLeft: 0,
                                alignItems: 'center',
                                justifyContent: shouldCenterContent ? 'center' : 'space-between',
                            }}>
                            <Animated.View
                                style={{
                                    flex: shouldCenterContent ? 0 : 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: isRideConfirmedPetBanner ? 'center' : 'space-between',
                                    paddingHorizontal: 21,
                                }}>
                                <Animated.View
                                    style={{
                                        flex: shouldCenterContent ? 0 : 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: isRideConfirmedPetBanner ? 'center' : 'flex-start',
                                    }}>
                                    {!postIcon && (
                                        <Animated.View style={{ marginRight: 8, alignItems: 'center' }}>
                                            {IconType}
                                        </Animated.View>
                                    )}
                                    {isPetBanner || isRideConfirmedPetBanner ? (
                                        <Typography
                                            type="body-7"
                                            style={{
                                                color: '#3B3A3C',
                                                fontWeight: 800,
                                                fontSize: 14,
                                                fontFamily: 'AreaNormal-Extrabold',
                                                paddingLeft: 76,
                                            }}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {bannerType !== undefined ? getBannerText() : ''}
                                        </Typography>
                                    ) : (
                                        <Text
                                            style={{
                                                color: getTextColor,
                                                fontWeight: getFontWeight,
                                                fontSize: getFontSize,
                                                fontFamily: 'AreaNormal-Extrabold',
                                                flex: postIcon ? 0 : shouldCenterContent ? 0 : 1,
                                            }}>
                                            {bannerType !== undefined ? getBannerText() : ''}
                                        </Text>
                                    )}
                                    {postIcon && (
                                        <Animated.View style={{ marginLeft: 5, alignItems: 'center' }}>
                                            {IconType}
                                        </Animated.View>
                                    )}
                                    {bannerType !== undefined && getBannerAdditionalText() !== '' && (
                                        <Text
                                            style={{
                                                textDecorationLine: 'underline',
                                                color: '#FFFFFF',
                                                fontWeight: 600,
                                                marginLeft: 4,
                                            }}>
                                            {getBannerAdditionalText()}
                                        </Text>
                                    )}
                                </Animated.View>
                                {isPetBanner && !isRideConfirmedPetBanner
                                    ? null
                                    : (showCircleInfo && isInsuranceBanner && (
                                          <Image source={nyIcInfoWhite} style={tailwind.style('w-6 h-6')} />
                                      )) ||
                                      (showInfo && !isRideConfirmedPetBanner && !isBusinessBanner ? (
                                          <Icon icon={<ChevronRight color="#FFFFFF" />} style={{ marginLeft: 8 }} />
                                      ) : null)}
                            </Animated.View>
                        </Animated.View>
                    </Pressable>

                    <Animated.View
                        style={[
                            {
                                width: '100%',
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                backgroundColor: handlerBGColor,
                                height: 25,
                                marginBottom: -1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            },
                        ]}>
                        {showHandle && (
                            <Animated.View
                                style={[
                                    {
                                        height: 3,
                                        width: 34,
                                        borderRadius: 1.5,
                                        backgroundColor: '#E0DCE3',
                                    },
                                ]}
                            />
                        )}
                    </Animated.View>
                </Animated.View>
            ) : (
                <Animated.View
                    style={[
                        {
                            width: '100%',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            backgroundColor: handlerBGColor,
                            height: 25,
                            marginBottom: -1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
                    ]}>
                    {showHandle && (
                        <Animated.View
                            style={[
                                {
                                    height: 3,
                                    width: 34,
                                    borderRadius: 1.5,
                                    backgroundColor: '#E0DCE3',
                                },
                            ]}
                        />
                    )}
                </Animated.View>
            )}
        </>
    );
};

export const getEstimatesBottomSheetTopBannerType = (
    hasDisability: boolean | undefined,
    specialAssistance: disability | undefined | null,
    bottomSheetStage: BottomSheetStage,
    isInsured: boolean,
    isPetRide: boolean | undefined,
    selectedTripType: 'PERSONAL' | 'BUSINESS' | undefined,
): BottomSheetTopBannerType | undefined => {
    if (bottomSheetStage === BottomSheetStage.ConfirmPickup) return BottomSheetTopBannerType.SpecialPickUpLocation;

    // Priority 1: Disability
    if (hasDisability) {
        if (specialAssistance === undefined) return BottomSheetTopBannerType.SpecialAssistanceOff;
        if (specialAssistance === null) return undefined;

        switch (specialAssistance.description) {
            case 'Blind/Low Vision':
                return BottomSheetTopBannerType.Blind;
            case 'Hearing Impairment (Deaf/Mute)':
                return BottomSheetTopBannerType.Deaf;
            case 'Locomotor Disability':
                return BottomSheetTopBannerType.Locomotor;
            case 'Other':
                return BottomSheetTopBannerType.OtherDisability;
            case '':
                return BottomSheetTopBannerType.SpecialAssistanceOff;
            default:
                return undefined;
        }
    }

    if (selectedTripType === 'BUSINESS' && isPetRide) {
        return BottomSheetTopBannerType.MultipleSelections;
    }

    // Priority 2: Business Ride
    if (selectedTripType === 'BUSINESS') {
        return BottomSheetTopBannerType.BusinessRide;
    }

    // Priority 3: Pet Ride
    if (isPetRide) {
        return BottomSheetTopBannerType.PetRide;
    }

    // Priority 4: Insurance
    if (isInsured) {
        return BottomSheetTopBannerType.RideInsurance;
    }

    return undefined;
};

export const getRideConfirmedBottomSheetTopBannerType = (
    hasDisability: boolean | undefined,
    specialAssistance: disability | undefined | null,
    isPetRide: boolean | undefined,
): BottomSheetTopBannerType | undefined => {
    // Priority 1: Disability
    if (hasDisability) {
        switch (specialAssistance?.description) {
            case 'Blind/Low Vision':
                return BottomSheetTopBannerType.Blind;
            case 'Hearing Impairment (Deaf/Mute)':
                return BottomSheetTopBannerType.Deaf;
            case 'Locomotor Disability':
                return BottomSheetTopBannerType.Locomotor;
            case 'Other':
                return BottomSheetTopBannerType.OtherDisability;
            case '':
                return BottomSheetTopBannerType.SpecialAssistanceOff;
            default:
                return undefined;
        }
    }

    // Priority 3: Pet Ride
    if (isPetRide) {
        return BottomSheetTopBannerType.RideConfirmedPetRide;
    }

    return undefined;
};

export const BottomSheetTopBanner = React.memo(BottomSheetTopBanner_);

export function BgSvg({ color = '#974DFF' }) {
    return (
        <Svg width={57} height={54} viewBox="0 0 57 54" fill="none">
            <Path
                d="M28.903 1.013c-2.918 0-6.04-1.63-8.682-.755-2.73.884-4.304 4.081-6.576 5.735-2.273 1.653-5.813 2.19-7.482 4.484-1.668 2.295-1.076 5.772-1.96 8.498-.856 2.642-3.397 5.11-3.397 8.029 0 2.918 2.552 5.398 3.398 8.03.883 2.728.306 6.228 1.959 8.5 1.653 2.273 5.187 2.816 7.482 4.485 2.295 1.668 3.847 4.847 6.576 5.734 2.642.853 5.772-.778 8.682-.778s6.059 1.631 8.683.778c2.729-.887 4.303-4.08 6.575-5.734 2.273-1.654 5.814-2.193 7.482-4.485 1.669-2.291 1.076-5.772 1.96-8.5.856-2.643 3.397-5.112 3.397-8.03 0-2.918-2.552-5.395-3.397-8.03-.888-2.725-.306-6.228-1.96-8.497-1.653-2.269-5.186-2.816-7.482-4.488-2.295-1.672-3.846-4.847-6.575-5.73-2.624-.876-5.765.754-8.683.754z"
                fill={color}
            />
        </Svg>
    );
}
